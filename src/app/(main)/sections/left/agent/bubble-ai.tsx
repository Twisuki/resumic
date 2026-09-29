"use client"

import ReasoningBlock from "@/app/(main)/sections/left/agent/reasoning-block"

/**
 * @description ai 气泡, 左对齐; parts 数组里 text / reasoning 在气泡内, tool 部分由 list 提到气泡外独立行
 */
export default function BubbleAi({
  text,
  reasoning,
}: Readonly<{ text: string, reasoning?: string }>) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">
        {reasoning && <ReasoningBlock text={reasoning} />}
        {text && <div className="whitespace-pre-wrap break-words">{text}</div>}
      </div>
    </div>
  )
}
