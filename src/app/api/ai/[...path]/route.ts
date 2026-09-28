import type { NextRequest } from "next/server"
import { controller } from "@server/controller"

/**
 * @description AI 流式中转: /api/ai/* 全部按 active config 转发到上游 LLM
 *
 * 客户端 AI SDK 的 baseURL 指向 /api/ai, SDK 自行拼接 provider 路径
 * (如 /api/ai/chat/completions, /api/ai/messages), 服务端拼到 active.baseUrl 之后
 */
async function handle(req: NextRequest, ctx: RouteContext<"/api/ai/[...path]">): Promise<Response> {
  const { path } = await ctx.params
  return controller.ai.proxy(req, path)
}

export {
  handle as DELETE,
  handle as GET,
  handle as HEAD,
  handle as OPTIONS,
  handle as PATCH,
  handle as POST,
  handle as PUT,
}
