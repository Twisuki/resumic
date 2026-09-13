import type { NextRequest } from "next/server"
import { controller } from "@server/controller"
import { NextResponse } from "next/server"

/**
 * @description 获取当前账号的 AI + 头像配额
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/user/quota">): Promise<NextResponse> {
  return NextResponse.json(await controller.user.quota())
}
