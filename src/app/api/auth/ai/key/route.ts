import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ok } from "@/server/api"

/**
 * @description 设置用户自配 AI key 与模型
 */
export async function PUT(_req: NextRequest, _ctx: RouteContext<"/api/auth/ai/key">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}

/**
 * @description 清除用户自配 AI key
 */
export async function DELETE(_req: NextRequest, _ctx: RouteContext<"/api/auth/ai/key">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
