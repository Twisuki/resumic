import type { UIMessage } from "ai"
import type { NextRequest } from "next/server"
import { controller } from "@server/controller"

/**
 * @description AI 对话流式中继
 */
export async function POST(req: NextRequest, _ctx: RouteContext<"/api/ai/chat">): Promise<Response> {
  const body = (await req.json()) as { messages: UIMessage[] }
  return controller.ai.chat(body.messages, req.signal)
}
