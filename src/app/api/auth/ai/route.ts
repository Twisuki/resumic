import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ok } from "@/server/api"

/**
 * @description 获取当前账号的 AI 配额
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/auth/ai">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
