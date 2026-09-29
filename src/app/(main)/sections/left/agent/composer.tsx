"use client"

import { IconPlayerStop, IconSend, IconSettings } from "@tabler/icons-react"
import { useState } from "react"
import SettingsDialog from "@/app/(main)/sections/left/agent/settings-dialog"
import { Button } from "@/components/ui/button"
import { useAi, useAiStatus } from "@/hooks/ai"

/**
 * @description 上下布局: 上面 textarea, 下面一行两按钮 (设置 + 发送/停止) 平分宽度
 */
export default function Composer() {
  const [text, setText] = useState("")
  const [settingsOpen, setSettingsOpen] = useState(false)
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
    <div className="flex flex-col gap-2 border-t border-sidebar-border p-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="说点什么..."
        rows={3}
        className="w-full resize-none rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={() => setSettingsOpen(true)}
        >
          <IconSettings className="size-4" />
          <span>设置</span>
        </Button>
        <Button
          type="button"
          className="w-full justify-center gap-2"
          disabled={!isStreaming && !trimmed}
          onClick={isStreaming ? stop : handleSend}
        >
          {isStreaming
            ? (
                <>
                  <IconPlayerStop className="size-4" />
                  <span>停止</span>
                </>
              )
            : (
                <>
                  <IconSend className="size-4" />
                  <span>发送</span>
                </>
              )}
        </Button>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
