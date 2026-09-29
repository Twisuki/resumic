"use client"

import { IconPlayerStop, IconSend } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAi, useAiStatus } from "@/hooks/ai"

/**
 * @description 底部多行输入 + 发送/停止按钮; enter 仅换行, 唯一发送入口是点 send
 */
export default function Composer() {
  const [text, setText] = useState("")
  const { send, stop } = useAi()
  const { status } = useAiStatus()

  const trimmed = text.trim()
  const isStreaming = status === "streaming"

  function handleSend() {
    if (!trimmed)
      return
    void send(trimmed)
    setText("")
  }

  return (
    <div className="flex gap-2 border-t border-sidebar-border p-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="说点什么..."
        rows={2}
        className="flex-1 resize-none rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button
        type="button"
        size="icon"
        disabled={!isStreaming && !trimmed}
        onClick={isStreaming ? stop : handleSend}
        aria-label={isStreaming ? "停止" : "发送"}
      >
        {isStreaming ? <IconPlayerStop className="size-4" /> : <IconSend className="size-4" />}
      </Button>
    </div>
  )
}
