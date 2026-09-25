"use client"

import type { LineNode } from "@shared/model/node"
import { useEffect, useRef, useState } from "react"
import { MarkdownEditor } from "@/components/markdown"
import { diffLines, splitLines } from "@/components/rich-content/diff"
import { Field, FieldLabel } from "@/components/ui/field"
import { useHistory } from "@/hooks/history"
import { useRichContent } from "@/hooks/rich-content"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 停止输入后落 patch 的延迟
 */
const COMMIT_DELAY = 400

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
 * @description 富文本编辑: 只做 Content(node) ⇄ md 字符串 + diff → patch, 编辑能力由 MarkdownEditor 提供
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
  const dirtyRef = useRef(false)
  const pendingRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { patch, undo, redo } = useHistory()

  // 外部源变化 (undo / redo / 切换) 时同步; 有未提交输入时不覆盖
  useEffect(() => {
    if (!dirtyRef.current) {
      setLocal(source)
    }
  }, [source])

  function applyCommit(next: string) {
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
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const next = pendingRef.current
    pendingRef.current = null
    if (next !== null)
      applyCommit(next)
  }

  function handleChange(next: string) {
    setLocal(next)
    dirtyRef.current = true
    pendingRef.current = next
    if (timerRef.current)
      clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, COMMIT_DELAY)
  }

  function handleUndo() {
    flush()
    undo()
    dirtyRef.current = false
    setLocal(readPartSource(parentId))
  }

  function handleRedo() {
    flush()
    redo()
    dirtyRef.current = false
    setLocal(readPartSource(parentId))
  }

  return (
    <Field>
      <FieldLabel>内容</FieldLabel>
      <MarkdownEditor
        source={local}
        onChange={handleChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
    </Field>
  )
}
