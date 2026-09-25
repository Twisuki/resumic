import type { ReactNode } from "react"
import { PAPER } from "@/config/paper"
import { cn } from "@/lib/utils"

/**
 * @description 简历容器 (一张 A4 纸): 尺寸固定, 内容横向居中、贴顶, 超出部分裁掉
 */
export default function Paper({
  className,
  children,
}: Readonly<{
  className?: string
  children: ReactNode
}>) {
  return (
    <div
      className={cn(
        "bg-white shadow-lg shrink-0 flex items-start justify-center overflow-hidden p-16",
        className,
      )}
      style={{ width: PAPER.WIDTH, height: PAPER.HEIGHT }}
    >
      {children}
    </div>
  )
}
