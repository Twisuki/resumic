import type { ReactNode } from "react"

/**
 * @description 加粗
 */
export default function Strong({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <strong>{children}</strong>
}
