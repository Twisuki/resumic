import type { UIMessage } from "ai"
import { err } from "@server/api"
import { auth as authenticate } from "@server/auth"
import { service, ServiceError } from "@server/service"
import { ErrorCode } from "@shared/error-code"
import { createUIMessageStreamResponse, toUIMessageStream } from "ai"
import { NextResponse } from "next/server"

export const ai = {
  /**
   * @description 调 auth 拿 session, 委托 service.ai.chat, 返流式 Response
   */
  async chat(messages: UIMessage[], abortSignal: AbortSignal): Promise<Response> {
    const authed = await authenticate()
    if (!authed.ok) {
      return NextResponse.json(err(authed.code, authed.msg))
    }
    try {
      const result = await service.ai.chat(authed.session.userId, messages, abortSignal)
      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      })
    }
    catch (e) {
      if (e instanceof ServiceError) {
        return NextResponse.json(err(e.code, e.msg))
      }
      console.error(e)
      return NextResponse.json(err(ErrorCode.System.Internal, "服务异常"))
    }
  },
}
