import type { AuthResult, Session } from "@server/auth"
import type { ApiResponse } from "@shared/model"
import { err, ok } from "@server/api"
import { auth as authenticate } from "@server/auth"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"

export interface WithSessionOptions<T, AutoAuth extends boolean = true> {
  autoAuthError?: AutoAuth
  onError?: (e: unknown) => ApiResponse<T>
}

type WithSessionFn<T, AutoAuth extends boolean> = (
  session: AutoAuth extends true ? Session : Session | null,
  authed: AuthResult,
) => Promise<T>

/**
 * @description 鉴权后跑 fn, 结果包进信封. auth 失败 / fn 抛错按 options 处理
 */
export async function withSession<T, AutoAuth extends boolean = true>(
  fn: WithSessionFn<T, AutoAuth>,
  options: WithSessionOptions<T, AutoAuth> = {},
): Promise<ApiResponse<T>> {
  const autoAuthError: boolean = options.autoAuthError ?? true
  const { onError } = options

  const authed = await authenticate()
  if (!authed.ok && autoAuthError) {
    return err(authed.code, authed.msg)
  }

  const session = (authed.ok ? authed.session : null) as AutoAuth extends true ? Session : Session | null

  try {
    return ok(await fn(session, authed))
  }
  catch (e) {
    if (onError) {
      return onError(e)
    }
    if (e instanceof ServiceError) {
      return err(e.code, e.msg)
    }
    console.error(e)
    return err(ErrorCode.System.Internal, "服务异常")
  }
}
