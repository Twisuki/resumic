import { readSessionToken } from "@/server/auth/cookie"
import { verifySession } from "@/server/auth/jwt"
import { repo } from "@/server/repo"
import { ErrorCode } from "@/shared/error-code"

export interface Session {
  userId: number
  github: string
  name: string
  status: "active" | "disabled"
}

export type AuthResult
  = | { ok: true, session: Session }
    | { ok: false, code: typeof ErrorCode.Auth.Required | typeof ErrorCode.Auth.Forbidden, msg: string }

/**
 * @description 读 cookie 验 JWT 查 user 返 Session 或 AuthResult
 */
export async function auth(): Promise<AuthResult> {
  const token = await readSessionToken()
  if (!token) {
    return { ok: false, code: ErrorCode.Auth.Required, msg: "未登录" }
  }

  let userId: number
  try {
    ({ userId } = await verifySession(token))
  }
  catch {
    return { ok: false, code: ErrorCode.Auth.Required, msg: "会话无效或已过期" }
  }

  const u = await repo.user.findById(userId)
  if (!u) {
    return { ok: false, code: ErrorCode.Auth.Required, msg: "用户不存在" }
  }
  if (u.status !== "active") {
    return { ok: false, code: ErrorCode.Auth.Forbidden, msg: "账号已禁用" }
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

export async function authOrNull(): Promise<Session | null> {
  throw new Error("authOrNull() not implemented")
}
