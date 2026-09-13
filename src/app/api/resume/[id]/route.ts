import type { Resume } from "@shared/model"
import type { NextRequest } from "next/server"
import { ErrorCode } from "@shared/error-code"
import { NextResponse } from "next/server"
import { err } from "@/server/api"
import { controller } from "@/server/controller"

/**
 * @description 获取单份简历
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/resume/[id]">): Promise<NextResponse> {
  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json(err(ErrorCode.Resume.NotFound, "简历不存在"))
  }
  return NextResponse.json(await controller.resume.getResume(numId))
}

/**
 * @description 全量更新简历
 */
export async function PUT(req: NextRequest, ctx: RouteContext<"/api/resume/[id]">): Promise<NextResponse> {
  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json(err(ErrorCode.Resume.NotFound, "简历不存在"))
  }
  const data = (await req.json()) as Resume
  return NextResponse.json(await controller.resume.updateResume(numId, data))
}

/**
 * @description 删除简历
 */
export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/resume/[id]">): Promise<NextResponse> {
  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json(err(ErrorCode.Resume.NotFound, "简历不存在"))
  }
  return NextResponse.json(await controller.resume.deleteResume(numId))
}
