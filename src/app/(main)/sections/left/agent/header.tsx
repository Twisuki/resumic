"use client"

import { IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import ClearConfirmDialog from "@/app/(main)/sections/left/agent/clear-confirm-dialog"
import { Button } from "@/components/ui/button"
import { useActiveConfig, useAi, useAiMessages, useAiStatus } from "@/hooks/ai"
import { cn } from "@/lib/utils"

/**
 * @description header: 模型名 + 状态点 + 清空, 全部居左; 设置按钮已迁到 composer
 */
export default function Header() {
  const active = useActiveConfig()
  const { clear } = useAi()
  const { status } = useAiStatus()
  const messages = useAiMessages()
  const hasMessages = messages.length > 0
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <header className="h-12 shrink-0 px-3 flex items-center gap-2 text-sm font-semibold border-b border-sidebar-border">
        <span className="truncate">
          {active ? active.label : "未配置 AI 模型"}
        </span>
        <span
          aria-label={`状态: ${status}`}
          className={cn(
            "size-1.5 rounded-full shrink-0",
            status === "idle" && "bg-muted-foreground/40",
            status === "streaming" && "bg-emerald-500 animate-pulse",
            status === "error" && "bg-destructive",
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="清空对话"
          disabled={!hasMessages}
          onClick={() => setConfirmOpen(true)}
        >
          <IconTrash className="size-4" />
        </Button>
      </header>
      <ClearConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={clear}
      />
    </>
  )
}
