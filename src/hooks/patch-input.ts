"use client"

import type { ChangeEvent, KeyboardEvent, CompositionEvent as ReactCompositionEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { registerFlush, useHistory } from "@/hooks/history"
import { isWordBoundary } from "@/lib/text"

/**
 * @description 非合成输入没有词边界可依时的兜底提交延迟
 */
const FALLBACK_DELAY = 800

/**
 * @description 输入框本地态与按"词"提交的 patch
 * - IME: 每次 compositionend 提交一次, 即"一个词/一段"一条历史
 * - 非 IME: 敲到空白立即提交, 否则长停顿兜底
 * - 回车 / 失焦立即提交, 回车与 IME 冲突时让路给输入法
 * - 向 history 注册 flush, 使 Ctrl+Z 撤销前先落地未提交内容
 */
export function usePatchInput(id: string, key: string, value: string) {
  const [local, setLocal] = useState(value)
  const composingRef = useRef(false)
  const pendingRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flushRef = useRef<() => void>(() => {})
  const { patch } = useHistory()

  // 没有未提交内容时, 跟随外部值 (undo / redo / 切换)
  useEffect(() => {
    if (pendingRef.current === null) {
      setLocal(value)
    }
  }, [value])

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function commit() {
    clearTimer()
    const next = pendingRef.current
    pendingRef.current = null
    if (next !== null)
      patch.update(id, key, next)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setLocal(next)
    pendingRef.current = next
    clearTimer()

    if (composingRef.current)
      return

    if (isWordBoundary((e.nativeEvent as InputEvent).data))
      commit()
    else
      timerRef.current = setTimeout(commit, FALLBACK_DELAY)
  }

  function handleCompositionStart() {
    composingRef.current = true
    clearTimer()
  }

  function handleCompositionEnd(e: ReactCompositionEvent<HTMLInputElement>) {
    composingRef.current = false
    const next = e.currentTarget.value
    setLocal(next)
    pendingRef.current = next
    commit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing)
      return
    if (e.key === "Enter") {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  useEffect(() => {
    flushRef.current = commit
  })
  useEffect(() => registerFlush(() => flushRef.current()), [])

  return {
    value: local,
    onChange: handleChange,
    onBlur: () => commit(),
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  }
}
