import type { ErrorCodeFailure } from "@shared/error-code"
import type { ApiResponse } from "@shared/model"
import { ErrorCode } from "@shared/error-code"

const BASE_URL = "/api"

/**
 * @description 请求失败时抛出的错误, 带信封里的业务码
 */
export class ApiClientError extends Error {
  readonly code: ErrorCodeFailure

  constructor(code: ErrorCodeFailure, msg: string) {
    super(msg)
    this.name = "ApiClientError"
    this.code = code
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  signal?: AbortSignal
}

/**
 * @description 判断错误是否为鉴权失败 (未登录 / 被禁)
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiClientError
    && (error.code === ErrorCode.Auth.Required || error.code === ErrorCode.Auth.Forbidden)
}

/**
 * @description 统一 fetch, 解包 { code, data, msg }, code 非 0 抛 ApiClientError
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options
  const form = body instanceof FormData

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      cache: "no-store",
      credentials: "same-origin",
      headers: form || body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : form ? body : JSON.stringify(body),
    })
  }
  catch (e) {
    // 中断是 TanStack 取消查询的正常路径, 原样抛出让上层忽略
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e
    }
    throw new ApiClientError(ErrorCode.System.Internal, "网络异常")
  }

  let payload: ApiResponse<T>
  try {
    payload = await res.json() as ApiResponse<T>
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, `响应解析失败 (HTTP ${res.status})`)
  }

  if (payload.code !== ErrorCode.OK) {
    throw new ApiClientError(payload.code, payload.msg)
  }

  return payload.data
}
