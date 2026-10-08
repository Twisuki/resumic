"use client"

import type { ClipboardEvent, FormEvent, Ref } from "react"
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react"
import { renderEditable } from "@/components/markdown/editable"
import { isWordBoundary } from "@/lib/text"
import { cn } from "@/lib/utils"

/**
 * @description 父组件命令式 API
 * - focus: 聚焦并把光标放到指定字符偏移
 */
export interface MarkdownEditorHandle {
  focus: (caret: number) => void
}

interface MarkdownEditorProps {
  /** 父组件命令式句柄 */
  ref?: Ref<MarkdownEditorHandle>
  source: string
  onChange: (next: string) => void
  /** 词边界 / 失焦 / 合成结束时触发, 作为落库时机 */
  onCommit?: (next: string) => void
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
 * @description markdown 多行编辑组件, 完全受控于外部 source
 *
 * 用 `contenteditable="plaintext-only"` 让浏览器原生把 Enter / Backspace / Delete 处理为纯文本 \n 操作,
 * 文本始终直接进 textContent, 没有 `<br>` / `<div>` 结构差异. 这样:
 * - DOM 与 source 始终同步, 没有"patch 已发但 DOM 未更新"的 race window
 * - 用户连续快速敲键不会丢字
 * - 跨行合并/拆分通过 `onInput` 拿到的 textContent 在父组件 commit 时统一 diff 成 LineNode 级 patch
 *
 * `whitespace-pre-wrap` 把 \n 渲染为可见换行, 与 `renderEditable` 不 escape \n 配合.
 */
export default function MarkdownEditor({
  ref,
  source,
  onChange,
  onCommit,
  onUndo,
  onRedo,
  className,
}: Readonly<MarkdownEditorProps>) {
  const elRef = useRef<HTMLDivElement>(null)
  const composingRef = useRef(false)
  const renderedRef = useRef<string | null>(null)
  const caretRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useImperativeHandle(ref, () => ({
    focus(caret) {
      const el = elRef.current
      if (!el)
        return
      el.focus()
      setCaretOffset(el, caret)
    },
  }), [])

  // 源变化时重渲染并恢复光标; 输入时的光标由 caretRef 传递
  useLayoutEffect(() => {
    const el = elRef.current
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
      const el = elRef.current
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

  function handleInput(e?: FormEvent<HTMLDivElement>) {
    if (composingRef.current)
      return
    const el = elRef.current
    if (!el)
      return
    const next = el.textContent ?? ""
    caretRef.current = caretOffset(el)
    onChange(next)

    // 词边界立即落库; 跨行操作由浏览器原生完成, 走 onInput 路径
    const input = e?.nativeEvent as InputEvent | undefined
    if (isWordBoundary(input?.data ?? null))
      onCommit?.(next)
  }

  function handleBeforeInput(e: FormEvent<HTMLDivElement>) {
    const inputType = (e.nativeEvent as InputEvent).inputType

    if (inputType === "historyUndo") {
      e.preventDefault()
      onUndo?.()
      return
    }
    if (inputType === "historyRedo") {
      e.preventDefault()
      onRedo?.()
    }

    // 其它 (insertParagraph / deleteContentBackward / deleteContentForward 等) 全部交给浏览器原生处理,
    // DOM 文本会自然更新, onInput 触发后由父组件 commitLines diff 出 LineNode 级 patch
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const el = elRef.current
    const selection = window.getSelection()
    if (!el || !selection || selection.rangeCount === 0)
      return

    const range = selection.getRangeAt(0)
    range.deleteContents()
    // 规范化换行: Windows 剪贴板常带 \r\n, Mac 老格式 \r, 统一为 \n
    const text = e.clipboardData.getData("text/plain").replace(/\r\n?/g, "\n")
    const node = document.createTextNode(text)
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    handleInput()
    onCommit?.(el.textContent ?? "")
  }

  return (
    <div
      ref={elRef}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      spellCheck={false}
      className={cn(
        "min-h-9 break-words whitespace-pre-wrap rounded-md border border-border bg-transparent px-3 py-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      onInput={handleInput}
      onBeforeInput={handleBeforeInput}
      onPaste={handlePaste}
      onFocus={() => {
        const el = elRef.current
        if (el)
          applyActiveState(el, caretOffset(el))
      }}
      onBlur={() => {
        const el = elRef.current
        if (!el)
          return
        applyActiveState(el, null)
        onCommit?.(el.textContent ?? "")
      }}
      onCompositionStart={() => {
        composingRef.current = true
      }}
      onCompositionEnd={() => {
        composingRef.current = false
        const el = elRef.current
        if (!el)
          return
        const next = el.textContent ?? ""
        caretRef.current = caretOffset(el)
        onChange(next)
        onCommit?.(next)
      }}
    />
  )
}
