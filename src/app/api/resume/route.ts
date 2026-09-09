import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ok } from "@/server/api"

/**
 * @description 获取简历列表
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/resume">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}

/**
 * @description 创建新简历, body 由前端提供(空/模板/导入均可)
 */
export async function POST(_req: NextRequest, _ctx: RouteContext<"/api/resume">): Promise<NextResponse> {
  return NextResponse.json(ok(null))
}
