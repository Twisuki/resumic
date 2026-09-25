"use client"

import type { ClipboardEvent, FormEvent } from "react"
import { useEffect, useLayoutEffect, useRef } from "react"
import { renderEditable } from "@/components/markdown/editable"
import { cn } from "@/lib/utils"

interface MarkdownEditorProps {
  source: string
  onChange: (next: string) => void
  onUndo?: () => void
  onRedo?: () => void
  className?: string
}

/**
 * @description 光标前的字符数 (含零宽分隔符文本节点)
 */
function caretOffset(el: HTMLElement): number {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0)
    return 0
  const range = selection.getRangeAt(0)
  if (!el.contains(range.startContainer))
    return 0
  const before = range.cloneRange()
  before.selectNodeContents(el)
  before.setEnd(range.startContainer, range.startOffset)
  return before.toString().length
}

/**
 * @description 按字符偏移恢复光标
 */
function setCaretOffset(el: HTMLElement, offset: number): void {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let remaining = offset
  let node = walker.nextNode()

  while (node) {
    const length = node.textContent?.length ?? 0
    if (remaining <= length) {
      range.setStart(node, remaining)
      range.collapse(true)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      return
    }
    remaining -= length
    node = walker.nextNode()
  }

  range.selectNodeContents(el)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

/**
 * @description 按光标激活 token: 只展开光标所在区间的分隔符, 其余折叠
 */
function applyActiveState(el: HTMLElement, caret: number | null): void {
  for (const token of el.querySelectorAll<HTMLElement>("[data-md-token]")) {
    const start = Number(token.dataset.mdStart)
    const end = Number(token.dataset.mdEnd)
    if (caret !== null && caret >= start && caret <= end)
      token.setAttribute("data-md-active", "")
    else
      token.removeAttribute("data-md-active")
  }
}

/**
 * @description markdown 编辑组件, 受控于 md 字符串, 不持有内容状态与历史栈
 * 编辑区即展示区: 完整行内 token 折叠为富文本, 光标进入时再展开分隔符
 */
export default function MarkdownEditor({
  source,
  onChange,
  onUndo,
  onRedo,
  className,
}: Readonly<MarkdownEditorProps>) {
  const ref = useRef<HTMLDivElement>(null)
  const composingRef = useRef(false)
  const renderedRef = useRef<string | null>(null)
  const caretRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  // 源变化时重渲染并恢复光标; 输入时的光标由 caretRef 传递
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || source === renderedRef.current)
      return
    el.innerHTML = renderEditable(source)
    renderedRef.current = source
    const focused = document.activeElement === el
    if (focused)
      setCaretOffset(el, caretRef.current ?? source.length)
    caretRef.current = null
    applyActiveState(el, focused ? caretOffset(el) : null)
  }, [source])

  // 光标移动 (点击 / 方向键 / 选择) 也要切换 token 显隐
  useEffect(() => {
    function handleSelectionChange() {
      const el = ref.current
      if (!el || document.activeElement !== el || rafRef.current !== null)
        return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        applyActiveState(el, caretOffset(el))
      })
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
      if (rafRef.current !== null)
        cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function handleInput() {
    if (composingRef.current)
      return
    const el = ref.current
    if (!el)
      return
    caretRef.current = caretOffset(el)
    onChange(el.textContent ?? "")
  }

  function handleBeforeInput(e: FormEvent<HTMLDivElement>) {
    const inputType = (e.nativeEvent as InputEvent).inputType
    if (inputType === "historyUndo") {
      e.preventDefault()
      onUndo?.()
    }
    else if (inputType === "historyRedo") {
      e.preventDefault()
      onRedo?.()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const el = ref.current
    const selection = window.getSelection()
    if (!el || !selection || selection.rangeCount === 0)
      return

    const range = selection.getRangeAt(0)
    range.deleteContents()
    const node = document.createTextNode(e.clipboardData.getData("text/plain"))
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    handleInput()
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      spellCheck={false}
      className={cn(
        "min-h-40 break-words whitespace-pre-wrap rounded-md border border-border bg-transparent p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      onInput={handleInput}
      onBeforeInput={handleBeforeInput}
      onPaste={handlePaste}
      onFocus={() => {
        const el = ref.current
        if (el)
          applyActiveState(el, caretOffset(el))
      }}
      onBlur={() => {
        const el = ref.current
        if (el)
          applyActiveState(el, null)
      }}
      onCompositionStart={() => {
        composingRef.current = true
      }}
      onCompositionEnd={() => {
        composingRef.current = false
        handleInput()
      }}
    />
  )
}
