"use client"

import type { LineNode } from "@shared/model/node"
import { useEffect, useRef, useState } from "react"
import { MarkdownEditor } from "@/components/markdown"
import { diffLines, splitLines } from "@/components/rich-content/diff"
import { Field, FieldLabel } from "@/components/ui/field"
import { registerFlush, useHistory } from "@/hooks/history"
import { useRichContent } from "@/hooks/rich-content"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 没有词边界 / 合成结束时, 长停顿兜底提交的延迟
 */
const FALLBACK_DELAY = 1200

/**
 * @description 命令式读取父节点下的行 (undo / redo 后取最新树)
 */
function readPartLines(parentId: string) {
  const { profile, resume } = useResumeStore.getState()
  const parent = profile?.nodes.get(parentId) ?? resume?.nodes.get(parentId)
  return (parent?.children ?? []).map(id => ({
    id,
    content: ((profile?.nodes.get(id) ?? resume?.nodes.get(id)) as LineNode | undefined)?.self.content ?? "",
  }))
}

/**
 * @description 命令式拼接父节点下的行内容
 */
function readPartSource(parentId: string): string {
  return readPartLines(parentId).map(line => line.content).join("")
}

/**
 * @description 富文本编辑: 只做 Content(node) ⇄ md 字符串 + diff → patch, 编辑能力与落库时机由 MarkdownEditor 提供
 */
export default function RichContentEditor({
  ids,
  parentId,
}: Readonly<{
  ids: string[]
  parentId: string
}>) {
  const source = useRichContent(ids)
  const [local, setLocal] = useState(source)
  const localRef = useRef(source)
  const dirtyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { patch, undo, redo } = useHistory()
  const flushRef = useRef<() => void>(() => {})

  // 向 history 注册 flush, 使 Ctrl+Z / 保存前先落地未提交内容
  useEffect(() => {
    flushRef.current = flush
  })
  useEffect(() => registerFlush(() => flushRef.current()), [])

  // 外部源变化 (undo / redo / 切换) 时同步; 有未提交输入时不覆盖
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

  function applyCommit(next: string) {
    clearTimer()
    dirtyRef.current = false
    const diff = diffLines(readPartLines(parentId), splitLines(next))
    for (const edit of diff.edits)
      patch.update(edit.id, "content", edit.content)
    for (const id of diff.removes)
      patch.remove(parentId, id)
    for (const add of diff.adds)
      patch.add(parentId, { id: add.id, self: { content: add.content }, children: [] })
    patch.reorder(parentId, diff.order)
  }

  function flush() {
    if (dirtyRef.current)
      applyCommit(localRef.current)
    else
      clearTimer()
  }

  function handleChange(next: string) {
    setLocal(next)
    localRef.current = next
    dirtyRef.current = true
    clearTimer()
    timerRef.current = setTimeout(applyCommit, FALLBACK_DELAY, localRef.current)
  }

  function handleCommit(next: string) {
    setLocal(next)
    localRef.current = next
    dirtyRef.current = true
    applyCommit(next)
  }

  function handleUndo() {
    flush()
    undo()
    dirtyRef.current = false
    const next = readPartSource(parentId)
    setLocal(next)
    localRef.current = next
  }

  function handleRedo() {
    flush()
    redo()
    dirtyRef.current = false
    const next = readPartSource(parentId)
    setLocal(next)
    localRef.current = next
  }

  return (
    <Field>
      <FieldLabel>内容</FieldLabel>
      <MarkdownEditor
        source={local}
        onChange={handleChange}
        onCommit={handleCommit}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
    </Field>
  )
}
