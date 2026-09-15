import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ENV } from "@/config/env"

/**
 * @description 302 跳 GitHub OAuth 授权页
 */
export function GET(req: NextRequest, _ctx: RouteContext<"/api/auth/github">): NextResponse {
  const rawNext = req.nextUrl.searchParams.get("next") ?? "/"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/"
  const params = new URLSearchParams({
    client_id: ENV.GH_CLIENT.ID,
    redirect_uri: `${ENV.APP_URL}/api/auth/github/callback`,
    scope: "read:user",
    state: next,
  })
  return NextResponse.redirect(
    new URL(`https://github.com/login/oauth/authorize?${params}`),
  )
}
