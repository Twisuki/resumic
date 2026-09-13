"use client"

import { useDeferredValue } from "react"
import Markdown from "@/components/markdown/display"

/**
 * @description markdown 编辑组件, 受控于 md 字符串, 不持有内容状态与历史栈
 *
 * undo / redo 由上层通过 onUndo / onRedo 下发, 所以要拦 textarea 原生 historyUndo / historyRedo
 */
export default function MarkdownEditor({
  source,
  onChange,
  onUndo,
  onRedo,
}: Readonly<{
  source: string
  onChange: (next: string) => void
  onUndo?: () => void
  onRedo?: () => void
}>) {
  // 预览跟手但让路给输入: 不 debounce(会跳字), 只降优先级
  const preview = useDeferredValue(source)

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={source}
        onChange={e => onChange(e.target.value)}
        onBeforeInput={(e) => {
          const { inputType } = e.nativeEvent as InputEvent
          if (inputType === "historyUndo") {
            e.preventDefault()
            onUndo?.()
          }
          else if (inputType === "historyRedo") {
            e.preventDefault()
            onRedo?.()
          }
        }}
        className="w-full min-h-40 resize-y rounded-md border border-border bg-transparent p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      <div className="rounded-md border border-border p-3">
        <Markdown source={preview} />
      </div>
    </div>
  )
}
