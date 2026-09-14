import type { ReactNode } from "react"
import { PAPER } from "@/config/paper"
import { cn } from "@/lib/utils"

/**
 * @description 简历容器
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
        "bg-white shadow-lg flex items-center justify-center p-16",
        className,
      )}
      style={{ width: PAPER.WIDTH, height: PAPER.HEIGHT }}
    >
      {children}
    </div>
  )
}
