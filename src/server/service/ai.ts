import type { AiConfigEntity } from "@server/model/entity"
import { decryptKey } from "@server/auth/crypto"
import { repo } from "@server/repo"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"

/**
 * @description 由 controller 从 NextRequest 提取出的转发输入
 */
export interface AiProxyInput {
  method: string
  /** catch-all path 段, 如 ["chat", "completions"] */
  path: string[]
  /** 原始 query string, 含前导 "?" 或空串 */
  search: string
  /** 原始请求头 */
  headers: Headers
  /** 请求体; 无体 (GET / HEAD) 时为 undefined */
  body: ArrayBuffer | undefined
  signal: AbortSignal
}

/**
 * @description trial 路径的前端 header 名; 与 service 里的取值保持小写
 */
const TRIAL_HEADERS = {
  marker: "x-resumic-trial",
  key: "x-resumic-trial-key",
  apiStyle: "x-resumic-trial-apistyle",
  baseUrl: "x-resumic-trial-baseurl",
}

/**
 * @description 转发前剔除的 hop-by-hop 头 + 会泄漏会话或与鉴权冲突的头 (鉴权头由服务端重写)
 */
const REQUEST_HEADER_BLOCKLIST = new Set([
  "host",
  "connection",
  "content-length",
  "cookie",
  "authorization",
  "x-api-key",
  "accept-encoding",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
  "proxy-authorization",
  "proxy-connection",
  "te",
  "trailer",
  TRIAL_HEADERS.marker,
  TRIAL_HEADERS.key,
  TRIAL_HEADERS.apiStyle,
  TRIAL_HEADERS.baseUrl,
])

/**
 * @description 回写时剔除的头: undici 已解压响应, 长度 / 编码交给运行时重算
 */
const RESPONSE_HEADER_BLOCKLIST = new Set([
  "content-encoding",
  "content-length",
  "connection",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
])

/**
 * @description 拼接上游 URL: baseUrl 去尾斜杠 + path 段 + 原始 query
 */
function joinUpstreamUrl(baseUrl: string, path: string[], search: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "")
  const suffix = path.length > 0 ? `/${path.join("/")}` : ""
  return `${trimmed}${suffix}${search}`
}

/**
 * @description 按 apiStyle 注入鉴权头: openai 走 Authorization Bearer, anthropic 走 x-api-key
 */
function applyAuthHeader(headers: Headers, apiStyle: string, key: string): void {
  if (apiStyle === "anthropic") {
    headers.set("x-api-key", key)
    return
  }
  headers.set("authorization", `Bearer ${key}`)
}

/**
 * @description 拒掉本地 / 内网 / 私有 IP, 把 resumic 当 SSRF 跳板的口子堵上
 */
function assertPublicHttps(baseUrl: string): void {
  if (!/^https:\/\//i.test(baseUrl))
    throw new ServiceError(ErrorCode.Validation.InvalidParams, "trial baseUrl 必须 https")
  let host = ""
  try {
    host = new URL(baseUrl).hostname.toLowerCase()
  }
  catch {
    throw new ServiceError(ErrorCode.Validation.InvalidParams, "trial baseUrl 不合法")
  }
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "0.0.0.0")
    throw new ServiceError(ErrorCode.Validation.InvalidParams, "trial baseUrl 不允许内网 / loopback")
  const parts = host.split(".")
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    const a = Number(parts[0])
    const b = Number(parts[1])
    const isPrivate
      = a === 10
        || (a === 172 && b >= 16 && b <= 31)
        || (a === 192 && b === 168)
        || (a === 169 && b === 254)
        || a === 127
        || a === 0
    if (isPrivate)
      throw new ServiceError(ErrorCode.Validation.InvalidParams, "trial baseUrl 不允许内网 / loopback")
  }
}

/**
 * @description 取用户 active 配置并解密 key, 无 active 时抛 Ai.ConfigNotFound
 */
async function resolveActive(userId: number): Promise<AiConfigEntity & { plainKey: string }> {
  const user = await repo.user.findById(userId)
  if (!user?.activeConfigId) {
    throw new ServiceError(ErrorCode.Ai.ConfigNotFound, "未配置 AI 模型")
  }
  const config = await repo.aiConfig.findById(user.activeConfigId)
  if (!config) {
    throw new ServiceError(ErrorCode.Ai.ConfigNotFound, "未配置 AI 模型")
  }
  return { ...config, plainKey: decryptKey(config.encryptedKey) }
}

/**
 * @description trial 转发输入: apiStyle / baseUrl / key 由请求 header 提供, 不走用户表
 */
export interface AiTrialProxyInput {
  apiStyle: "openai" | "anthropic"
  baseUrl: string
  key: string
}

/**
 * @description 共享上游转发骨架: 拼接 URL / 清头 / 注入鉴权 / fetch / 流式回写
 */
async function forwardToUpstream(
  config: { baseUrl: string, apiStyle: string, plainKey: string },
  input: AiProxyInput,
): Promise<Response> {
  const url = joinUpstreamUrl(config.baseUrl, input.path, input.search)

  const headers = new Headers()
  input.headers.forEach((value, name) => {
    if (!REQUEST_HEADER_BLOCKLIST.has(name.toLowerCase())) {
      headers.set(name, value)
    }
  })
  applyAuthHeader(headers, config.apiStyle, config.plainKey)

  const hasBody = input.method !== "GET" && input.method !== "HEAD"
  const upstream = await fetch(url, {
    method: input.method,
    headers,
    body: hasBody ? input.body : undefined,
    signal: input.signal,
  })

  const responseHeaders = new Headers()
  upstream.headers.forEach((value, name) => {
    if (!RESPONSE_HEADER_BLOCKLIST.has(name.toLowerCase())) {
      responseHeaders.set(name, value)
    }
  })

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export const ai = {
  /**
   * @description 按 active config 把请求转发到其 baseUrl, 注入鉴权头, 原样流式回写响应
   */
  async proxy(userId: number, input: AiProxyInput): Promise<Response> {
    return forwardToUpstream(await resolveActive(userId), input)
  },

  /**
   * @description trial 转发: 不查用户表, 直接按请求里的 apiStyle / baseUrl / key 转发
   *
   * apiStyle / key / baseUrl 已在 controller 兜底, 此处再加 https + 非内网校验, 避免任意透传到内网
   */
  async proxyTrial(trial: AiTrialProxyInput, input: AiProxyInput): Promise<Response> {
    if (trial.apiStyle !== "openai" && trial.apiStyle !== "anthropic")
      throw new ServiceError(ErrorCode.Validation.InvalidParams, "不支持的 apiStyle")
    if (!trial.key)
      throw new ServiceError(ErrorCode.Validation.InvalidParams, "缺少 API key")
    if (!trial.baseUrl)
      throw new ServiceError(ErrorCode.Validation.InvalidParams, "缺少 baseUrl")
    assertPublicHttps(trial.baseUrl)
    return forwardToUpstream({ baseUrl: trial.baseUrl, apiStyle: trial.apiStyle, plainKey: trial.key }, input)
  },
}
