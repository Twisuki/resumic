import type { ReactNode } from "react"

/**
 * @description 列表项
 */
export default function Li({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <li>{children}</li>
}
