"use client"

import { IconSettings, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import ClearConfirmDialog from "@/app/(main)/sections/left/agent/clear-confirm-dialog"
import { Button } from "@/components/ui/button"
import { useActiveConfig, useAi, useAiMessages, useAiStatus } from "@/hooks/ai"
import { cn } from "@/lib/utils"

/**
 * @description header 行内组件: 模型名 + 状态点 + 清空 (弹 dialog) + 设置
 */
export default function Header({
  onSettingsClick,
}: Readonly<{ onSettingsClick: () => void }>) {
  const active = useActiveConfig()
  const { clear } = useAi()
  const { status } = useAiStatus()
  const messages = useAiMessages()
  const hasMessages = messages.length > 0
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 border-b border-sidebar-border px-2 h-9 shrink-0">
        <span className="text-xs font-medium truncate">
          {active ? active.label : "未配置 AI 模型"}
        </span>
        <span
          aria-label={`状态: ${status}`}
          className={cn(
            "size-1.5 rounded-full",
            status === "idle" && "bg-muted-foreground/40",
            status === "streaming" && "bg-emerald-500 animate-pulse",
            status === "error" && "bg-destructive",
          )}
        />
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="清空对话"
            disabled={!hasMessages}
            onClick={() => setConfirmOpen(true)}
          >
            <IconTrash className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="设置"
            onClick={onSettingsClick}
          >
            <IconSettings className="size-3.5" />
          </Button>
        </div>
      </div>
      <ClearConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={clear}
      />
    </>
  )
}
