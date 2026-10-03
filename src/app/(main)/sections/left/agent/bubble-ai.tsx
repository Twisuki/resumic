"use client"

import type { SyntheticEvent } from "react"
import { IconChevronDown } from "@tabler/icons-react"
import { useState } from "react"
import ReasoningBlock from "@/app/(main)/sections/left/agent/reasoning-block"
import { cn } from "@/lib/utils"

/**
 * @description ai 气泡, 左对齐; parts 数组里 text / reasoning 在气泡内, tool 部分由 list 提到气泡外独立行
 * collapsible=true 时用 details 默认折叠, 用于“中间过程”段(最后一个 tool 之前的自言自语); 最终段不折叠
 */
export default function BubbleAi({
  text,
  reasoning,
  collapsible = false,
}: Readonly<{ text: string, reasoning?: string, collapsible?: boolean }>) {
  const [open, setOpen] = useState(false)
  const body = (
    <>
      {reasoning && <ReasoningBlock text={reasoning} />}
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
          <span>思考过程</span>
        </summary>
        <div className="mt-2">{body}</div>
      </details>
    </div>
  )
}
