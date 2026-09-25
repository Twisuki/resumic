"use client"

import { useEffect, useRef, useState } from "react"
import { useHistory } from "@/hooks/history"

/**
 * @description 输入框本地态与防抖 patch 提交
 * 聚焦期间不被外部值覆盖, 失焦补提交, 卸载后待提交仍会落 patch
 */
export function usePatchInput(id: string, key: string, value: string, delay = 300) {
  const [local, setLocal] = useState(value)
  const [focused, setFocused] = useState(false)
  const pendingRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { patch } = useHistory()

  useEffect(() => {
    if (!focused) {
      // eslint-disable-next-line react/set-state-in-effect -- 非聚焦时同步外部 undo/redo 结果
      setLocal(value)
    }
  }, [value, focused])

  function commit() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const next = pendingRef.current
    pendingRef.current = null
    if (next !== null && next !== value)
      patch.update(id, key, next)
  }

  function change(next: string) {
    setLocal(next)
    pendingRef.current = next
    if (timerRef.current)
      clearTimeout(timerRef.current)
    timerRef.current = setTimeout(commit, delay)
  }

  return {
    value: local,
    onChange: change,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false)
      commit()
    },
  }
}
