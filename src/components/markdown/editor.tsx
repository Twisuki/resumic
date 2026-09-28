"use client"

import type { ClipboardEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent, Ref } from "react"
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
 * @description 父组件命令式 API: 跨行操作之后由父组件调用 focus 投递光标
 */
export interface MarkdownEditorHandle {
  focus: (caret: number) => void
}

interface MarkdownEditorProps {
  /** 父组件命令式句柄: 跨行操作之后由父组件调用 focus 投递光标 */
  ref?: Ref<MarkdownEditorHandle>
  source: string
  onChange: (next: string) => void
  /** 词边界 / 失焦 / 合成结束时触发, 作为落库时机 */
  onCommit?: (next: string) => void
  onUndo?: () => void
  onRedo?: () => void
  /** Enter: 在 caret 处把行拆成两段, head 留在当前, tail 交给父组件落到新行 */
  onSplit?: (caret: number) => void
  /** Backspace 在行首: 与上一行合并 (无上一行时由父组件决定 no-op) */
  onMergePrev?: () => void
  /** Delete / End-Forward 在行尾: 与下一行合并 (无下一行时由父组件决定 no-op) */
  onMergeNext?: () => void
  /** ArrowUp 在行首: 把光标送到上一行末 */
  onMovePrev?: () => void
  /** ArrowDown 在行尾: 把光标送到下一行首 */
  onMoveNext?: () => void
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
 * @description markdown 单行编辑组件, 完全受控于外部 source
 * 跨行操作 (Enter / Backspace-at-start / Delete-at-end / Arrow 行边界) 通过回调交给父组件编排
 */
export default function MarkdownEditor({
  ref,
  source,
  onChange,
  onCommit,
  onUndo,
  onRedo,
  onSplit,
  onMergePrev,
  onMergeNext,
  onMovePrev,
  onMoveNext,
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

    // 词边界立即落库; Enter 在 beforeinput 阶段拦截, 不进入 input 路径
    const input = e?.nativeEvent as InputEvent | undefined
    if (isWordBoundary(input?.data ?? null))
      onCommit?.(next)
  }

  function handleBeforeInput(e: FormEvent<HTMLDivElement>) {
    const el = elRef.current
    if (!el)
      return
    const inputType = (e.nativeEvent as InputEvent).inputType

    if (inputType === "historyUndo") {
      e.preventDefault()
      onUndo?.()
      return
    }
    if (inputType === "historyRedo") {
      e.preventDefault()
      onRedo?.()
      return
    }

    // Enter / Shift+Enter: 阻止浏览器默认块分裂, caret 经 onSplit 交由父组件拆行
    if (inputType === "insertParagraph" || inputType === "insertLineBreak") {
      const caret = caretOffset(el)
      caretRef.current = caret
      e.preventDefault()
      onSplit?.(caret)
      return
    }

    // Backspace 在行首: 与上一行合并
    if (inputType === "deleteContentBackward" && onMergePrev) {
      if (caretOffset(el) === 0) {
        e.preventDefault()
        onMergePrev()
        return
      }
    }

    // 行尾 forward-delete (Delete 键 / Mac Cmd+Delete 等): 与下一行合并
    if (
      inputType === "deleteContentForward"
      || inputType === "deleteHardLineBackward"
      || inputType === "deleteHardLineForward"
    ) {
      if (onMergeNext && caretOffset(el) === source.length) {
        e.preventDefault()
        onMergeNext()
      }
    }
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const el = elRef.current
    if (!el)
      return
    // ArrowUp 在行首 / ArrowDown 在行尾: 跨行 nav
    if (e.key === "ArrowUp" && caretOffset(el) === 0) {
      e.preventDefault()
      onMovePrev?.()
      return
    }
    if (e.key === "ArrowDown" && caretOffset(el) === source.length) {
      e.preventDefault()
      onMoveNext?.()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const el = elRef.current
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
    onCommit?.(el.textContent ?? "")
  }

  return (
    <div
      ref={elRef}
      contentEditable
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
      onKeyDown={handleKeyDown}
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
