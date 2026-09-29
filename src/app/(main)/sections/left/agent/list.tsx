"use client"

import { isReasoningUIPart, isTextUIPart, isToolUIPart } from "ai"
import { Fragment } from "react"
import BubbleAi from "@/app/(main)/sections/left/agent/bubble-ai"
import BubbleUser from "@/app/(main)/sections/left/agent/bubble-user"
import ToolCard from "@/app/(main)/sections/left/agent/tool-card"
import { useAiMessages } from "@/hooks/ai"

/**
 * @description list 滚动容器: 流式堆叠 user 气泡 / ai 气泡 / tool 卡片, tool 部分提到气泡外独立居中行
 */
export default function List() {
  const messages = useAiMessages()

  return (
    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
      {messages.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          开始与 AI 对话吧
        </div>
      )}
      {messages.map((message) => {
        const textParts = message.parts.filter(isTextUIPart)
        const reasoningParts = message.parts.filter(isReasoningUIPart)
        const toolParts = message.parts.filter(isToolUIPart)

        if (message.role === "user") {
          const text = textParts.map(p => p.text).join("")
          return <BubbleUser key={message.id} text={text} />
        }

        const text = textParts.map(p => p.text).join("")
        const reasoning = reasoningParts.map(p => p.text).join("\n")

        return (
          <Fragment key={message.id}>
            <BubbleAi text={text} reasoning={reasoning || undefined} />
            {toolParts.map((part, idx) => (
              <ToolCard
                key={`${message.id}-tool-${idx}-${"toolCallId" in part ? part.toolCallId : idx}`}
                part={part}
              />
            ))}
          </Fragment>
        )
      })}
    </div>
  )
}
