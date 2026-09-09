import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ok } from "@/server/api"

/**
 * @description 健康检查
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/health">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
