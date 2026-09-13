import type { NextRequest } from "next/server"
import { ok } from "@server/api"
import { NextResponse } from "next/server"

/**
 * @description 上传头像文件
 */
export async function POST(_req: NextRequest, _ctx: RouteContext<"/api/avatar">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}

/**
 * @description 删除已上传的头像
 */
export async function DELETE(_req: NextRequest, _ctx: RouteContext<"/api/avatar">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}

/**
 * @description 查看头像配额
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/avatar">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
