import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const A4_WIDTH = 794
const A4_HEIGHT = 1123

/**
 * @description 简历容器
 */
export default function Paper({
  scale,
  className,
  children,
}: Readonly<{
  scale: number
  className?: string
  children: ReactNode
}>) {
  return (
    <div
      className={cn(
        "bg-white shadow-lg origin-top overflow-hidden",
        className,
      )}
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  )
}
