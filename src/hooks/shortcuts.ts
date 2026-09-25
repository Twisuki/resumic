"use client"

import { useEffect } from "react"
import { useHistory } from "@/hooks/history"

/**
 * @description 全局快捷键: 撤销 / 重做 / 保存
 */
export function useShortcuts() {
  const { undo, redo, save } = useHistory()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.isComposing)
        return

      const key = e.key.toLowerCase()

      if (key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault()
        redo()
      }
      else if (key === "s") {
        e.preventDefault()
        save()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, save])
}
