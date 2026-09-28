import type { CreateAiConfigRequest } from "@shared/model"
import type { NextRequest } from "next/server"
import { controller } from "@server/controller"
import { NextResponse } from "next/server"

/**
 * @description 列出当前账号的 AI 配置 (不含 key)
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/ai/config">): Promise<NextResponse> {
  return NextResponse.json(await controller.aiConfig.list())
}

/**
 * @description 新建 AI 配置 (label / apiStyle / baseUrl / model / key)
 */
export async function POST(req: NextRequest, _ctx: RouteContext<"/api/ai/config">): Promise<NextResponse> {
  const data = (await req.json()) as CreateAiConfigRequest
  return NextResponse.json(await controller.aiConfig.create(data))
}
