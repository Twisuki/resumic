import type { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ENV } from "@/config/env"

/**
 * @description session cookie 名
 */
export function sessionCookieName(): string {
  return ENV.NODE_ENV === "production"
    ? `__Host-${ENV.SESSION.COOKIE_NAME}`
    : ENV.SESSION.COOKIE_NAME
}

/**
 * @description 从 request cookie 读 session token
 */
export async function readSessionToken(): Promise<string | undefined> {
  const c = await cookies()
  return c.get(sessionCookieName())?.value
}

/**
 * @description 写 session cookie 到 response
 */
export function setSessionToken(res: NextResponse, value: string): void {
  res.cookies.set(sessionCookieName(), value, {
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
  res.cookies.delete(sessionCookieName())
}
