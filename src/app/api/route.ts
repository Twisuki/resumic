import type { NextRequest } from "next/server"
import { controller } from "@server/controller"
import { NextResponse } from "next/server"

/**
 * @description 探活 endpoint, 返 hello / ok / db 字段, 不鉴权
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api">): Promise<NextResponse> {
  return NextResponse.json(await controller.health.check())
}
