"use client"

import type { SyntheticEvent } from "react"
import { IconChevronDown, IconLoader2 } from "@tabler/icons-react"
import { useState } from "react"
import ReasoningBlock from "@/app/(main)/sections/left/agent/reasoning-block"
import { cn } from "@/lib/utils"

/**
 * @description ai 气泡, 左对齐; parts 数组里 text / reasoning 在气泡内, tool 部分由 list 提到气泡外独立行
 * collapsible=true 时用 details 默认折叠, 用于“中间过程”段(首个 text 之前的所有 reasoning + 自言自语); 最终段不折叠
 * reasoningStreaming=true 时 summary 标签变为“思考中...” + spin, body 也仅显示“思考中...”不透露中间内容, 等所有 reasoning 完成才写实际内容
 */
export default function BubbleAi({
  text,
  reasoning,
  collapsible = false,
  reasoningStreaming = false,
}: Readonly<{ text: string, reasoning?: string, collapsible?: boolean, reasoningStreaming?: boolean }>) {
  const [open, setOpen] = useState(false)
  // 折叠展开两种情况下都隐藏 reasoning 实际文本, 只显示“思考中...”, 直到所有 reasoning 完成
  const showPlaceholder = reasoningStreaming && collapsible
  const body = (
    <>
      {showPlaceholder && (
        <div className="text-xs italic text-muted-foreground">思考中...</div>
      )}
      {!showPlaceholder && reasoning && <ReasoningBlock text={reasoning} />}
      {text && <div className="whitespace-pre-wrap break-words">{text}</div>}
    </>
  )
  if (!collapsible) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">{body}</div>
      </div>
    )
  }
  return (
    <div className="flex justify-start">
      <details
        open={open}
        onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => setOpen(e.currentTarget.open)}
        className="max-w-[80%] rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 px-3 py-2 text-sm"
      >
        <summary className="flex cursor-pointer select-none items-center gap-1 text-xs text-muted-foreground">
          <IconChevronDown className={cn("size-3 transition-transform", !open && "-rotate-90")} />
          <span>{reasoningStreaming ? "思考中..." : "思考过程"}</span>
          {reasoningStreaming && <IconLoader2 className="size-3 animate-spin" />}
        </summary>
        <div className="mt-2">{body}</div>
      </details>
    </div>
  )
}
