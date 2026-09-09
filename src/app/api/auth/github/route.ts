import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ok } from "@/server/api"

/**
 * @description 跳转 GitHub OAuth 授权页
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/auth/github">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
