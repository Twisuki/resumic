import type { UpdateAiConfigRequest } from "@shared/model"
import type { NextRequest } from "next/server"
import { controller } from "@server/controller"
import { NextResponse } from "next/server"

/**
 * @description 把指定 AI 配置设为 active
 */
export async function POST(_req: NextRequest, ctx: RouteContext<"/api/ai/config/[id]">): Promise<NextResponse> {
  const { id } = await ctx.params
  return NextResponse.json(await controller.aiConfig.activate(id))
}

/**
 * @description 部分更新 AI 配置 (未传字段不动, 传 key 则覆盖)
 */
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/ai/config/[id]">): Promise<NextResponse> {
  const { id } = await ctx.params
  const data = (await req.json()) as UpdateAiConfigRequest
  return NextResponse.json(await controller.aiConfig.update(id, data))
}

/**
 * @description 删除 AI 配置
 */
export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/ai/config/[id]">): Promise<NextResponse> {
  const { id } = await ctx.params
  return NextResponse.json(await controller.aiConfig.remove(id))
}
