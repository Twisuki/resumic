import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { err } from "@/server/api"
import { setSessionToken } from "@/server/auth/cookie"
import { controller } from "@/server/controller"
import { ErrorCode } from "@/shared/error-code"

/**
 * @description 处理 OAuth 回调, 写 cookie + 302 回 next
 */
export async function GET(req: NextRequest, _ctx: RouteContext<"/api/auth/github/callback">): Promise<NextResponse> {
  const code = req.nextUrl.searchParams.get("code")
  const rawState = req.nextUrl.searchParams.get("state") ?? "/"
  const next = rawState.startsWith("/") && !rawState.startsWith("//") ? rawState : "/"

  if (!code) {
    return NextResponse.json(err(ErrorCode.Auth.Required, "缺少 code"))
  }

  try {
    const result = await controller.auth.githubCallback(code)
    if (result.code !== 0) {
      return NextResponse.json(result)
    }

    const res = NextResponse.redirect(new URL(next, req.url))
    setSessionToken(res, result.data.jwt)
    return res
  }
  catch {
    return NextResponse.json(err(ErrorCode.System.Internal, "OAuth 回调处理失败"))
  }
}
