"use client"

import { IconPlayerStop, IconSend, IconSettings } from "@tabler/icons-react"
import { useLayoutEffect, useRef, useState } from "react"
import SettingsDialog from "@/app/(main)/sections/left/agent/settings-dialog"
import { Button } from "@/components/ui/button"
import { useAi, useAiStatus } from "@/hooks/ai"

/**
 * @description textarea 自适应高度: 起始 ≈ 3 行 (与原 rows={3} 视觉一致), 长内容撑高到 6 行封顶, 之后内部滚动
 *
 * 实现思路: useLayoutEffect 监听 text 变化, 把 textarea 高度先重置成 auto 拿到自然 scrollHeight,
 * 再夹在 [MIN, MAX] 之间赋回去. minHeight / maxHeight 作为 CSS 兜底, 保证
 *   - 内容极少时不至于被压扁成 0 高度
 *   - 内容溢出时浏览器接管内部滚动
 */
const MIN_HEIGHT = 72
const MAX_HEIGHT = 144

export default function Composer() {
  const [text, setText] = useState("")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { send, stop } = useAi()
  const { status } = useAiStatus()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmed = text.trim()
  const isStreaming = status === "streaming"

  // 同步设置高度到自然高度 (夹在 [MIN, MAX] 之间); layout effect 在绘制前跑, 无闪烁
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el)
      return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [text])

  function handleSend() {
    if (!trimmed)
      return
    void send(trimmed)
    setText("")
  }

  return (
    <div className="flex flex-col gap-2 border-t border-sidebar-border p-2">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter")
            return
          // Shift+Enter 走默认换行; IME 输入法选词中也不抢走 Enter
          if (e.shiftKey || e.nativeEvent.isComposing)
            return
          e.preventDefault()
          handleSend()
        }}
        placeholder="是有什么问题吗 ?"
        rows={3}
        style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
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
