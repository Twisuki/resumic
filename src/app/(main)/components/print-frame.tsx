"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { usePrint } from "@/app/(main)/hooks/print"
import { isPrintMessage } from "@/lib/print-protocol"

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

  useEffect(() => {
    function onMessage(event: MessageEvent<unknown>) {
      if (event.source !== iframeRef.current?.contentWindow)
        return
      if (!isPrintMessage(event.data))
        return
      // 只发失败原因; success 不需要回执
      toast.error(event.data.msg)
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
    }
  }, [])

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
