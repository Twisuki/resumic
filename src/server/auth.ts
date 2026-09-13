import { ErrorCode } from "@shared/error-code"
import { readSessionToken } from "@/server/auth/cookie"
import { verifySession } from "@/server/auth/jwt"
import { repo } from "@/server/repo"

export interface Session {
  userId: number
  github: string
  name: string
  status: "active" | "disabled"
}

type AuthFailureCode = typeof ErrorCode.Auth.Required | typeof ErrorCode.Auth.Forbidden

export type AuthResult
  = | { ok: true, session: Session }
    | { ok: false, code: AuthFailureCode, msg: string }

function fail(code: AuthFailureCode, msg: string): AuthResult {
  return { ok: false, code, msg }
}

/**
 * @description 读 cookie 验 JWT 查 user 返 Session 或 AuthResult
 */
export async function auth(): Promise<AuthResult> {
  const token = await readSessionToken()
  if (!token) {
    return fail(ErrorCode.Auth.Required, "未登录")
  }

  let userId: number
  try {
    ({ userId } = await verifySession(token))
  }
  catch {
    return fail(ErrorCode.Auth.Required, "会话无效或已过期")
  }

  const u = await repo.user.findById(userId)
  if (!u) {
    return fail(ErrorCode.Auth.Required, "用户不存在")
  }
  if (u.status !== "active") {
    return fail(ErrorCode.Auth.Forbidden, "账号已禁用")
  }

  return {
    ok: true,
    session: {
      userId: u.id,
      github: u.github,
      name: u.name,
      status: u.status as "active" | "disabled",
    },
  }
}
