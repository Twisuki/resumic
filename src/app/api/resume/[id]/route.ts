import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ok } from "@/server/api"

/**
 * @description 获取单份简历
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/resume/[id]">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}

/**
 * @description 全量更新简历
 */
export async function PUT(_req: NextRequest, _ctx: RouteContext<"/api/resume/[id]">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}

/**
 * @description 部分更新简历字段
 */
export async function PATCH(_req: NextRequest, _ctx: RouteContext<"/api/resume/[id]">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}

/**
 * @description 删除简历
 */
export async function DELETE(_req: NextRequest, _ctx: RouteContext<"/api/resume/[id]">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
