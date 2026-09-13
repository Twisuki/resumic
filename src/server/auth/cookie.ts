import type { NextResponse } from "next/server"
import process from "node:process"
import { cookies } from "next/headers"

// env 里的空值(`KEY=`)要当未设置处理, `??` 会把空字符串当有效值
const CUSTOM_COOKIE_NAME = process.env.SESSION_COOKIE_NAME?.trim()

export const SESSION_COOKIE_NAME
  = CUSTOM_COOKIE_NAME || (process.env.NODE_ENV === "production" ? "__Host-session" : "session")

/**
 * @description 从 request cookie 读 session token
 */
export async function readSessionToken(): Promise<string | undefined> {
  const c = await cookies()
  return c.get(SESSION_COOKIE_NAME)?.value
}

/**
 * @description 写 session cookie 到 response
 */
export function setSessionToken(res: NextResponse, value: string): void {
  res.cookies.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })
}

/**
 * @description 清 response 上的 session cookie
 */
export function clearSessionToken(res: NextResponse): void {
  res.cookies.delete(SESSION_COOKIE_NAME)
}
