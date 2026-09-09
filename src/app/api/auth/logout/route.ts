import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ok } from "@/server/api"

/**
 * @description 退出登录并清除会话 cookie
 */
export async function POST(_req: NextRequest, _ctx: RouteContext<"/api/auth/logout">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
