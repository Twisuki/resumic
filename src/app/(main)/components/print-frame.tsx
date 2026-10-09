"use client"

import { useEffect, useRef } from "react"
import { usePrint } from "@/app/(main)/hooks/print"

/**
 * @description 隐藏的 iframe, 用于打印简历
 */
export default function PrintFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { register } = usePrint()

  useEffect(() => {
    return register((id) => {
      if (iframeRef.current)
        iframeRef.current.src = `/print/${id}`
    })
  }, [register])

  return (
    <iframe
      ref={iframeRef}
      title="简历打印"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        border: 0,
        visibility: "hidden",
      }}
    />
  )
}
