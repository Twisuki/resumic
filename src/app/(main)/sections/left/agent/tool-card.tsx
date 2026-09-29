"use client"

import type { Icon as TablerIcon } from "@tabler/icons-react"
import type { DynamicToolUIPart, UIDataTypes, UIMessagePart, UITools } from "ai"
import { IconCheck, IconLoader2, IconLock, IconX } from "@tabler/icons-react"
import { isToolUIPart } from "ai"
import { cn } from "@/lib/utils"

type ToolPart = Extract<UIMessagePart<UIDataTypes, UITools>, { type: `tool-${string}` }> | DynamicToolUIPart

/**
 * @description 工具卡片: list 内左右居中, 比气泡宽, 6 态 (input-streaming / input-available / approval-* / output-available / output-error / output-denied)
 */
export default function ToolCard({ part }: Readonly<{ part: ToolPart }>) {
  if (!isToolUIPart(part))
    return null
  const state = part.state

  const meta: { Icon: TablerIcon, label: string, tone: string, spin: boolean } = (() => {
    switch (state) {
      case "input-streaming":
      case "input-available":
        return { Icon: IconLoader2, label: "执行中", tone: "border-border bg-card text-foreground", spin: true }
      case "approval-requested":
      case "approval-responded":
        return { Icon: IconLoader2, label: "等待审批", tone: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300", spin: false }
      case "output-available":
        return { Icon: IconCheck, label: "完成", tone: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300", spin: false }
      case "output-error":
        return { Icon: IconX, label: "失败", tone: "border-destructive/40 bg-destructive/5 text-destructive", spin: false }
      case "output-denied":
        return { Icon: IconLock, label: "已拒绝", tone: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300", spin: false }
    }
  })()

  const Icon = meta.Icon
  const showInput = "input" in part && part.input !== undefined
  const showOutput = state === "output-available"
  const errorText = state === "output-error" ? part.errorText : null

  return (
    <div className="flex justify-center">
      <div
        className={cn(
          "w-[92%] max-w-[92%] rounded-md border px-3 py-2 text-xs",
          meta.tone,
        )}
      >
        <div className="flex items-center gap-2 font-medium">
          <Icon className={cn("size-3.5", meta.spin && "animate-spin")} />
          <span>
            {part.type.replace(/^tool-/, "")}
            {" · "}
            {meta.label}
          </span>
        </div>
        {showInput && (
          <pre className="mt-1 whitespace-pre-wrap break-words text-[11px] text-muted-foreground">
            {JSON.stringify(part.input, null, 2)}
          </pre>
        )}
        {showOutput && (
          <pre className="mt-1 whitespace-pre-wrap break-words text-[11px] text-muted-foreground">
            {JSON.stringify(part.output, null, 2)}
          </pre>
        )}
        {errorText && (
          <div className="mt-1 text-[11px] text-destructive">{errorText}</div>
        )}
      </div>
    </div>
  )
}
