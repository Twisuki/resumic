import type { Resume } from "@shared/model"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { controller } from "@/server/controller"

/**
 * @description 获取简历列表
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/resume">): Promise<NextResponse> {
  return NextResponse.json(await controller.resume.listResumes())
}

/**
 * @description 创建新简历, body 由前端提供(空/模板/导入均可)
 */
export async function POST(req: NextRequest, _ctx: RouteContext<"/api/resume">): Promise<NextResponse> {
  const data = (await req.json()) as Resume
  return NextResponse.json(await controller.resume.createResume(data))
}
