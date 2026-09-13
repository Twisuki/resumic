import type { SetAiKeyRequest } from "@shared/model"
import type { NextRequest } from "next/server"
import { controller } from "@server/controller"
import { NextResponse } from "next/server"

/**
 * @description 设置用户自配 AI key 与模型
 */
export async function PUT(req: NextRequest, _ctx: RouteContext<"/api/user/ai-key">): Promise<NextResponse> {
  const data = (await req.json()) as SetAiKeyRequest
  return NextResponse.json(await controller.user.setAiKey(data))
}

/**
 * @description 清除用户自配 AI key
 */
export async function DELETE(_req: NextRequest, _ctx: RouteContext<"/api/user/ai-key">): Promise<NextResponse> {
  return NextResponse.json(await controller.user.clearAiKey())
}
