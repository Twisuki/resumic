import type { NextRequest } from "next/server"
import { err } from "@server/api"
import { auth as authenticate } from "@server/auth"
import { service, ServiceError } from "@server/service"
import { ErrorCode } from "@shared/error-code"
import { NextResponse } from "next/server"

export const ai = {
  /**
   * @description 鉴权后把 /api/ai/* 的请求按 active config 转发到上游 LLM, 流式回写
   *
   * 不走 withSession: 该端点回的是原始 Response / 流, 不是 API 信封
   */
  async proxy(req: NextRequest, path: string[]): Promise<Response> {
    const authed = await authenticate()
    if (!authed.ok) {
      return NextResponse.json(err(authed.code, authed.msg), { status: 401 })
    }
    try {
      const hasBody = req.method !== "GET" && req.method !== "HEAD"
      return await service.ai.proxy(authed.session.userId, {
        method: req.method,
        path,
        search: req.nextUrl.search,
        headers: req.headers,
        body: hasBody ? await req.arrayBuffer() : undefined,
        signal: req.signal,
      })
    }
    catch (e) {
      if (e instanceof ServiceError) {
        return NextResponse.json(err(e.code, e.msg), { status: 400 })
      }
      console.error(e)
      return NextResponse.json(err(ErrorCode.System.Internal, "服务异常"), { status: 500 })
    }
  },
}
