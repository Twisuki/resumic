import type { ReactNode } from "react"

/**
 * @description 斜体
 */
export default function Em({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <em>{children}</em>
}
