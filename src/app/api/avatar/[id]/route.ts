import type { NextRequest } from "next/server"
import { err } from "@server/api"
import { controller } from "@server/controller"
import { ErrorCode } from "@shared/error-code"
import { NextResponse } from "next/server"

/**
 * @description 覆盖指定头像槽位的文件 (multipart: file), url 不变
 */
export async function PUT(req: NextRequest, ctx: RouteContext<"/api/avatar/[id]">): Promise<NextResponse> {
  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json(err(ErrorCode.Avatar.NotFound, "头像不存在"))
  }

  return NextResponse.json(await controller.avatar.replaceAvatar(numId, await req.formData()))
}

/**
 * @description 删除指定头像槽位
 */
export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/avatar/[id]">): Promise<NextResponse> {
  const { id } = await ctx.params
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json(err(ErrorCode.Avatar.NotFound, "头像不存在"))
  }

  return NextResponse.json(await controller.avatar.deleteAvatar(numId))
}
