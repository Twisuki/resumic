"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import MarkdownEditor from "@/components/markdown/editor"
import { commitLines } from "@/components/rich-content/commit"
import { Field, FieldLabel } from "@/components/ui/field"
import { registerFlush, useHistory } from "@/hooks/history"
import { useRichContent } from "@/hooks/rich-content"

/**
 * @description 没有词边界 / 合成结束时, 长停顿兜底提交的延迟
 */
const FALLBACK_DELAY = 1200

/**
 * @description 富文本编辑: 一个 MarkdownEditor 容纳整个 part 的多行内容
 * source = lines.join("\n"); MarkdownEditor 用 `plaintext-only` 让浏览器原生处理换行 / 跨行删除,
 * onInput 拿到的 textContent 经 commitLines 前后缀 diff 转 LineNode 级 patch
 *
 * 公共 API: ids 是父节点 (PartNode) 下的若干 LineNode id, parentId 是 PartNode id.
 * 即使 ids = [] (例如新建空 part) 也保持渲染一个编辑器, 用户首次输入会通过 commitLines 自动 add 第一个 LineNode.
 */
export default function RichContentEditor({
  ids,
  parentId,
}: Readonly<{
  ids: string[]
  parentId: string
}>) {
  const source = useRichContent(ids)
  const { patch, undo, redo } = useHistory()

  const [local, setLocal] = useState(source)
  const localRef = useRef(source)
  const dirtyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 外部 source 变化 (undo / redo / 落库) 时同步; 有未提交输入时不覆盖
  useEffect(() => {
    if (!dirtyRef.current) {
      setLocal(source)
      localRef.current = source
    }
  }, [source])

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  /**
   * @description 把 localRef.current (joined source) 落库
   */
  const applyCommit = useCallback(() => {
    clearTimer()
    if (!dirtyRef.current)
      return
    dirtyRef.current = false
    commitLines(parentId, localRef.current, patch)
  }, [parentId, patch])

  // 注册 flush: 撤销 / 手动保存前先把本地缓冲写回 store
  useEffect(() => {
    const flush = () => {
      if (dirtyRef.current)
        applyCommit()
    }
    return registerFlush(flush)
  }, [applyCommit])

  function handleChange(next: string) {
    setLocal(next)
    localRef.current = next
    dirtyRef.current = true
    clearTimer()
    timerRef.current = setTimeout(applyCommit, FALLBACK_DELAY)
  }

  function handleCommit(next: string) {
    setLocal(next)
    localRef.current = next
    dirtyRef.current = true
    applyCommit()
  }

  return (
    <Field>
      <FieldLabel>内容</FieldLabel>
      <MarkdownEditor
        source={local}
        onChange={handleChange}
        onCommit={handleCommit}
        onUndo={undo}
        onRedo={redo}
      />
    </Field>
  )
}
