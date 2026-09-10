import { ErrorCode } from "@/shared/error-code"

export interface Session {
  userId: number
  github: string
  name: string
  status: "active" | "disabled"
}

export type AuthResult
  = | { ok: true, session: Session }
    | { ok: false, code: typeof ErrorCode.Auth.Required, msg: string }

export async function auth(): Promise<AuthResult> {
  return { ok: false, code: ErrorCode.Auth.Required, msg: "未登录" }
}

export async function authOrNull(): Promise<Session | null> {
  throw new Error("authOrNull() not implemented")
}
