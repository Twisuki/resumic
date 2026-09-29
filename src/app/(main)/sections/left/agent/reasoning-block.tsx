"use client"

import { IconChevronDown } from "@tabler/icons-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * @description ai 推理块, 默认折叠, 点标题展开
 */
export default function ReasoningBlock({ text }: Readonly<{ text: string }>) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2 rounded border border-dashed border-muted-foreground/40 text-xs text-muted-foreground">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-1 px-2 py-1"
      >
        <IconChevronDown className={cn("size-3 transition-transform", !open && "-rotate-90")} />
        <span>思考过程</span>
      </button>
      {open && (
        <pre className="px-2 pb-2 whitespace-pre-wrap break-words font-sans">
          {text}
        </pre>
      )}
    </div>
  )
}
