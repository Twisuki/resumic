import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { clearSessionToken } from "@/server/auth/cookie"

/**
 * @description 清 cookie + 302 回 /
 */
export function POST(_req: NextRequest, _ctx: RouteContext<"/api/auth/logout">): NextResponse {
  const res = NextResponse.redirect(new URL("/", _req.url))
  clearSessionToken(res)
  return res
}
