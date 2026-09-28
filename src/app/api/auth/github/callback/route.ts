import type { NextRequest } from "next/server"
import { setSessionToken } from "@server/auth/cookie"
import { controller } from "@server/controller"
import { NextResponse } from "next/server"

/**
 * @description 处理 OAuth 回调, 写 cookie + 302 回 next
 */
export async function GET(req: NextRequest, _ctx: RouteContext<"/api/auth/github/callback">): Promise<NextResponse> {
  const code = req.nextUrl.searchParams.get("code")
  const rawState = req.nextUrl.searchParams.get("state") ?? "/"
  const next = rawState.startsWith("/") && !rawState.startsWith("//") ? rawState : "/"
  const safeNext = new URL(next, req.url)

  const fail = (reason: string, msg: string): NextResponse => {
    safeNext.searchParams.set("login", "failed")
    safeNext.searchParams.set("reason", reason)
    safeNext.searchParams.set("msg", msg)
    return NextResponse.redirect(safeNext)
  }

  if (!code) {
    return fail("missing_code", "GitHub 未返回授权码")
  }

  try {
    const result = await controller.auth.githubCallback(code)
    if (result.code !== 0) {
      return fail("callback_rejected", result.msg || "GitHub 回调被拒绝")
    }

    const res = NextResponse.redirect(safeNext)
    setSessionToken(res, result.data.jwt)
    return res
  }
  catch {
    return fail("internal_error", "OAuth 回调处理失败")
  }
}
