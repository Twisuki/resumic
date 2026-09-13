import type { NextRequest } from "next/server"
import process from "node:process"
import { NextResponse } from "next/server"

/**
 * @description 302 跳 GitHub OAuth 授权页
 */
export function GET(req: NextRequest, _ctx: RouteContext<"/api/auth/github">): NextResponse {
  const rawNext = req.nextUrl.searchParams.get("next") ?? "/"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/"
  const appUrl = process.env.APP_URL?.trim() || "http://localhost:3000"
  const params = new URLSearchParams({
    client_id: process.env.GH_CLIENT_ID ?? "",
    redirect_uri: `${appUrl}/api/auth/github/callback`,
    scope: "read:user",
    state: next,
  })
  return NextResponse.redirect(
    new URL(`https://github.com/login/oauth/authorize?${params}`),
  )
}
