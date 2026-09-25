import type { NextRequest } from "next/server"
import { controller } from "@server/controller"
import { NextResponse } from "next/server"

/**
 * @description 列出当前用户的头像槽位
 */
export async function GET(_req: NextRequest, _ctx: RouteContext<"/api/avatar">): Promise<NextResponse> {
  return NextResponse.json(await controller.avatar.listAvatars())
}

/**
 * @description 上传新头像槽位 (multipart: file)
 */
export async function POST(req: NextRequest, _ctx: RouteContext<"/api/avatar">): Promise<NextResponse> {
  return NextResponse.json(await controller.avatar.uploadAvatar(await req.formData()))
}
