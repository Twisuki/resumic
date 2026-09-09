import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ok } from "@/server/api"

/**
 * @description 处理 GitHub OAuth 回调
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/auth/github/callback">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
