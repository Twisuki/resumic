"use client"

import type { LineNode } from "@shared/model/node"
import type { MarkdownEditorHandle } from "@/components/markdown/editor"
import { useCallback, useEffect, useRef, useState } from "react"
import MarkdownEditor from "@/components/markdown/editor"
import { Field, FieldLabel } from "@/components/ui/field"
import { registerFlush, useHistory } from "@/hooks/history"
import { useRichContent } from "@/hooks/rich-content"
import { genId } from "@/lib/id"
import { leafSubtree } from "@/lib/tree"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 没有词边界 / 合成结束时, 长停顿兜底提交的延迟
 */
const FALLBACK_DELAY = 1200

interface PendingFocus {
  id: string
  caret: number
}

/**
 * @description 取出 parent 节点下当前所有 children 的 id; 不存在则返空
 */
function readChildren(parentId: string): string[] {
  const { profile, resume } = useResumeStore.getState()
  const tree = profile?.nodes.has(parentId) ? profile : resume
  if (!tree)
    return []
  return [...(tree.nodes.get(parentId)?.children ?? [])]
}

/**
 * @description 取出指定 LineNode 的 content; 缺则返 ""
 */
function readLineContent(parentId: string, lineId: string): string {
  const { profile, resume } = useResumeStore.getState()
  const tree = profile?.nodes.has(parentId) ? profile : resume
  if (!tree)
    return ""
  const node = tree.nodes.get(lineId) as LineNode | undefined
  return node?.self.content ?? ""
}

/**
 * @description 富文本编辑: 一行一个 MarkdownEditor, 跨行操作 (Enter / Backspace / Arrow / Delete) 由父组件编排
 *
 * 公共 API: ids 是父节点 (PartNode) 下的若干 LineNode id, parentId 是 PartNode id.
 * 拆行 / 合行通过 patch.update / patch.add / patch.remove 维护.
 */
export default function RichContentEditor({
  ids,
  parentId,
}: Readonly<{
  ids: string[]
  parentId: string
}>) {
  const handlesRef = useRef<Map<string, MarkdownEditorHandle>>(new Map())
  const [pendingFocus, setPendingFocus] = useState<PendingFocus | null>(null)
  const { patch } = useHistory()

  // 在 commit 之后, 给刚刚挂载 / 受影响的目标行投递一次 focus.
  // 顺序: 子 MarkdownEditor 的 ref 回调先把自己的 handle 注册进 handlesRef, 再触发本 effect.
  useEffect(() => {
    if (!pendingFocus)
      return
    const handle = handlesRef.current.get(pendingFocus.id)
    if (handle) {
      handle.focus(pendingFocus.caret)
      setPendingFocus(null)
    }
  }, [pendingFocus])

  function splitLine(currentId: string, caret: number) {
    const text = readLineContent(parentId, currentId)
    const head = text.slice(0, caret)
    const tail = text.slice(caret)
    const newId = genId()
    if (head !== text)
      patch.update(currentId, "content", head)
    // 新行始终 add, 即 tail 为空也建立空行 (与用户感受对齐: 回车 = 新行)
    patch.add(parentId, leafSubtree({
      id: newId,
      self: { content: tail },
      children: [],
    }))
    setPendingFocus({ id: newId, caret: 0 })
  }

  function mergeWithPrev(currentId: string) {
    const children = readChildren(parentId)
    const idx = children.indexOf(currentId)
    if (idx <= 0)
      return
    const prevId = children[idx - 1]
    const prevContent = readLineContent(parentId, prevId)
    const currentContent = readLineContent(parentId, currentId)
    patch.update(prevId, "content", prevContent + currentContent)
    patch.remove(parentId, currentId)
    setPendingFocus({ id: prevId, caret: prevContent.length })
  }

  function mergeWithNext(currentId: string) {
    const children = readChildren(parentId)
    const idx = children.indexOf(currentId)
    if (idx === -1 || idx >= children.length - 1)
      return
    const nextId = children[idx + 1]
    const currentContent = readLineContent(parentId, currentId)
    const nextContent = readLineContent(parentId, nextId)
    patch.update(currentId, "content", currentContent + nextContent)
    patch.remove(parentId, nextId)
    setPendingFocus({ id: currentId, caret: currentContent.length })
  }

  function moveToPrev(currentId: string) {
    const children = readChildren(parentId)
    const idx = children.indexOf(currentId)
    if (idx <= 0)
      return
    const prevId = children[idx - 1]
    const caret = readLineContent(parentId, prevId).length
    setPendingFocus({ id: prevId, caret })
  }

  function moveToNext(currentId: string) {
    const children = readChildren(parentId)
    const idx = children.indexOf(currentId)
    if (idx === -1 || idx >= children.length - 1)
      return
    const nextId = children[idx + 1]
    setPendingFocus({ id: nextId, caret: 0 })
  }

  return (
    <Field>
      <FieldLabel>内容</FieldLabel>
      <div className="flex flex-col gap-1">
        {ids.map(id => (
          <LineEditor
            key={id}
            id={id}
            onSplit={caret => splitLine(id, caret)}
            onMergePrev={() => mergeWithPrev(id)}
            onMergeNext={() => mergeWithNext(id)}
            onMovePrev={() => moveToPrev(id)}
            onMoveNext={() => moveToNext(id)}
            registerHandle={(handle) => {
              if (handle)
                handlesRef.current.set(id, handle)
              else
                handlesRef.current.delete(id)
            }}
          />
        ))}
      </div>
    </Field>
  )
}

interface LineEditorProps {
  id: string
  onSplit: (caret: number) => void
  onMergePrev: () => void
  onMergeNext: () => void
  onMovePrev: () => void
  onMoveNext: () => void
  registerHandle: (handle: MarkdownEditorHandle | null) => void
}

/**
 * @description 单个 LineNode 的编辑: 持有本地缓冲, debounced 落库, 跨行事件转发到父组件
 */
function LineEditor({
  id,
  onSplit,
  onMergePrev,
  onMergeNext,
  onMovePrev,
  onMoveNext,
  registerHandle,
}: LineEditorProps) {
  const source = useRichContent([id])
  const { patch } = useHistory()
  const [local, setLocal] = useState(source)
  const localRef = useRef(source)
  const dirtyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 外部源变化 (undo / redo / 跨行操作带来) 时同步; 有未提交输入时不覆盖
  useEffect(() => {
    if (!dirtyRef.current) {
      setLocal(source)
      localRef.current = source
    }
  }, [source])

  // 内部统一的落库动作, 跨行事件 / debounce / 失焦共用
  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const applyCommit = useCallback((next: string) => {
    clearTimer()
    dirtyRef.current = false
    patch.update(id, "content", next)
  }, [id, patch])

  // 注册 flush: 撤销 / 手动保存前先把本地缓冲写回 store
  useEffect(() => {
    const flush = () => {
      if (dirtyRef.current)
        applyCommit(localRef.current)
    }
    return registerFlush(flush)
  }, [applyCommit])

  function handleChange(next: string) {
    setLocal(next)
    localRef.current = next
    dirtyRef.current = true
    clearTimer()
    timerRef.current = setTimeout(applyCommit, FALLBACK_DELAY, next)
  }

  function handleCommit(next: string) {
    setLocal(next)
    localRef.current = next
    dirtyRef.current = true
    applyCommit(next)
  }

  return (
    <MarkdownEditor
      ref={registerHandle}
      source={local}
      onChange={handleChange}
      onCommit={handleCommit}
      onSplit={(caret) => {
        // 跨行操作前先把本地缓冲刷到 store, 让父组件读到最新文本
        if (dirtyRef.current)
          applyCommit(localRef.current)
        onSplit(caret)
      }}
      onMergePrev={() => {
        if (dirtyRef.current)
          applyCommit(localRef.current)
        onMergePrev()
      }}
      onMergeNext={() => {
        if (dirtyRef.current)
          applyCommit(localRef.current)
        onMergeNext()
      }}
      onMovePrev={onMovePrev}
      onMoveNext={onMoveNext}
    />
  )
}
