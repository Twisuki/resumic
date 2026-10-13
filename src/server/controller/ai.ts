import type { AiProxyInput, AiTrialProxyInput } from "@server/service/ai"
import type { NextRequest } from "next/server"
import { err } from "@server/api"
import { auth as authenticate } from "@server/auth"
import { service, ServiceError } from "@server/service"
import { ErrorCode } from "@shared/error-code"
import { NextResponse } from "next/server"

const TRIAL_HEADER_NAMES = {
  key: "x-resumic-trial-key",
  apiStyle: "x-resumic-trial-apistyle",
  baseUrl: "x-resumic-trial-baseurl",
} as const

/** @description 读 trial 转发 header; 三个都齐全且 apiStyle 合法才返回, 缺一不可 */
function readTrialHeaders(req: NextRequest): AiTrialProxyInput | null {
  const key = req.headers.get(TRIAL_HEADER_NAMES.key)
  const apiStyle = req.headers.get(TRIAL_HEADER_NAMES.apiStyle)
  const baseUrl = req.headers.get(TRIAL_HEADER_NAMES.baseUrl)
  if (!key || !apiStyle || !baseUrl)
    return null
  if (apiStyle !== "openai" && apiStyle !== "anthropic")
    return null
  return { key, apiStyle, baseUrl }
}

/** @description 从 NextRequest 抽 controller 要装的字段, 避免每个 route 手写 */
async function toAiProxyInput(req: NextRequest, path: string[]): Promise<AiProxyInput> {
  const hasBody = req.method !== "GET" && req.method !== "HEAD"
  return {
    method: req.method,
    path,
    search: req.nextUrl.search,
    headers: req.headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    signal: req.signal,
  }
}

function handleError(e: unknown): NextResponse {
  if (e instanceof ServiceError)
    return NextResponse.json(err(e.code, e.msg), { status: 400 })
  console.error(e)
  return NextResponse.json(err(ErrorCode.System.Internal, "服务异常"), { status: 500 })
}

export const ai = {
  /**
   * @description 鉴权优先: 已登录走服务端存的 active + 解密 key; 未登录允许 trial header 转发
   *
   * 不走 withSession: 该端点回的是原始 Response / 流, 不是 API 信封
   */
  async proxy(req: NextRequest, path: string[]): Promise<Response> {
    const authed = await authenticate()
    if (authed.ok) {
      try {
        return await service.ai.proxy(authed.session.userId, await toAiProxyInput(req, path))
      }
      catch (e) {
        return handleError(e)
      }
    }
    const trial = readTrialHeaders(req)
    if (!trial)
      return NextResponse.json(err(authed.code, authed.msg), { status: 401 })
    try {
      return await service.ai.proxyTrial(trial, await toAiProxyInput(req, path))
    }
    catch (e) {
      return handleError(e)
    }
  },
}
