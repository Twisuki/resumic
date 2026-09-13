import type { ReactNode } from "react"

/**
 * @description 引用块
 */
export default function Blockquote({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <blockquote>{children}</blockquote>
}
