"use client"

import { useCallback, useState } from "react"

export type Overlay = "agent" | "sidebar" | null
export type OverlayTarget = Exclude<Overlay, null>

export function useOverlay() {
  const [overlay, setOverlay] = useState<Overlay>(null)

  const isAgentOpen = overlay === "agent"
  const isSidebarOpen = overlay === "sidebar"

  const toggle = useCallback((target: OverlayTarget) => {
    setOverlay(prev => (prev === target ? null : target))
  }, [])

  const close = useCallback(() => setOverlay(null), [])

  return {
    overlay,
    isAgentOpen,
    isSidebarOpen,
    toggle,
    close,
  }
}
