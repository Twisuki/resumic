"use client"

import { isReasoningUIPart, isTextUIPart, isToolUIPart } from "ai"
import { Fragment, useEffect, useRef } from "react"
import BubbleAi from "@/app/(main)/sections/left/agent/bubble-ai"
import BubbleUser from "@/app/(main)/sections/left/agent/bubble-user"
import ToolCard from "@/app/(main)/sections/left/agent/tool-card"
import { useAiMessages } from "@/hooks/ai"

/**
 * @description list 滚动容器: 流式堆叠 user 气泡 / ai 气泡 / tool 卡片, tool 部分提到气泡外独立居中行; 新内容到达时若用户原本贴底则自动跟随, 滚上看历史时不强制拉回
 */
const BOTTOM_SLOP = 32

export default function List() {
  const messages = useAiMessages()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  // 监听滚动: 距底 < BOTTOM_SLOP 算贴底, 用 ref 避免触发 re-render
  useEffect(() => {
    const el = scrollRef.current
    if (!el)
      return
    function update() {
      const distance = el!.scrollHeight - el!.scrollTop - el!.clientHeight
      isAtBottomRef.current = distance < BOTTOM_SLOP
    }
    el.addEventListener("scroll", update, { passive: true })
    update()
    return () => el.removeEventListener("scroll", update)
  }, [])

  // 初始挂载滚到底: mobile Sheet 重开 (list 重新挂载) 时, 重置到末尾; desktop 首次加载同理
  useEffect(() => {
    const el = scrollRef.current
    if (el)
      el.scrollTop = el.scrollHeight
  }, [])

  // 内容变化时, 若贴底则滚到底
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !isAtBottomRef.current)
      return
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col gap-3">
      {messages.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          也许我可以帮忙呢 ~
        </div>
      )}
      {messages.map((message) => {
        const textParts = message.parts.filter(isTextUIPart)
        const toolParts = message.parts.filter(isToolUIPart)

        if (message.role === "user") {
          const text = textParts.map(p => p.text).join("")
          return <BubbleUser key={message.id} text={text} />
        }

        // 按首个 text part 切两段: 中间段(所有 reasoning + 工具之间的自言自语) vs 最终段(首个 text 起的输出)
        // 用首个 text 切分保证所有 reasoning 都进中间段, 不被“最后一个 tool”切掉
        const firstTextIdx = message.parts.findIndex(p => isTextUIPart(p))
        const splitIdx = firstTextIdx >= 0 ? firstTextIdx : message.parts.length
        const intermediateParts = message.parts.slice(0, splitIdx)
        const finalParts = message.parts.slice(splitIdx)

        const joinText = (ps: typeof message.parts) =>
          ps.filter(isTextUIPart).map(p => p.text).join("")
        const joinReasoning = (ps: typeof message.parts) =>
          ps.filter(isReasoningUIPart).map(p => p.text).join("\n")
        const hasStreamingReasoning = (ps: typeof message.parts) =>
          ps.some(p => isReasoningUIPart(p) && p.state === "streaming")

        const intermediateText = joinText(intermediateParts)
        const intermediateReasoning = joinReasoning(intermediateParts)
        const intermediateReasoningStreaming = hasStreamingReasoning(intermediateParts)
        const finalText = joinText(finalParts)
        const finalReasoning = joinReasoning(finalParts)
        const finalReasoningStreaming = hasStreamingReasoning(finalParts)

        const showIntermediate = !!(intermediateText || intermediateReasoning)
        const showFinal = !!(finalText || finalReasoning)

        // 新一轮工具到来时挤掉老的 output-available (仅作为“模型思考中”提示, 已被并行 active 工具取代)
        const hasActive = toolParts.some(p => p.state === "input-streaming" || p.state === "input-available")
        const visibleToolParts = hasActive
          ? toolParts.filter(p => p.state !== "output-available")
          : toolParts

        return (
          <Fragment key={message.id}>
            {showIntermediate && (
              <BubbleAi
                text={intermediateText}
                reasoning={intermediateReasoning || undefined}
                collapsible
                reasoningStreaming={intermediateReasoningStreaming}
              />
            )}
            {visibleToolParts.map((part, idx) => (
              <ToolCard
                key={`${message.id}-tool-${idx}-${"toolCallId" in part ? part.toolCallId : idx}`}
                part={part}
              />
            ))}
            {showFinal && (
              <BubbleAi
                text={finalText}
                reasoning={finalReasoning || undefined}
                reasoningStreaming={finalReasoningStreaming}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
