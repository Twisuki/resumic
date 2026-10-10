"use client"

import { Loader2 } from "lucide-react"
import { useLoading } from "@/app/(main)/hooks/loading"

/** @description 统一的页面级加载遮罩, 状态由 useLoading 计算, 本组件只负责渲染 */
export default function LoadingOverlay() {
  const { visible, message } = useLoading()
  if (!visible || !message)
    return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-150"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
