import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { controller } from "@/server/controller"

/**
 * @description 获取当前会话的用户信息
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/auth">): Promise<NextResponse> {
  return NextResponse.json(await controller.auth.me())
}
