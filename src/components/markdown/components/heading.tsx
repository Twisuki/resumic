import type { ReactNode } from "react"

/**
 * @description 标题, h1 到 h6 统一降级为加粗段落
 *
 * 字号层级归 Section 所有, 富文本里的标题不抢它; `data-level` 保留原始层级供后续样式区分
 */
export default function Heading({
  level,
  children,
}: Readonly<{
  level: number
  children: ReactNode
}>) {
  return (
    <p
      className="font-bold"
      data-level={level}
    >
      {children}
    </p>
  )
}
