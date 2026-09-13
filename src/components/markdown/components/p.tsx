import type { ReactNode } from "react"

/**
 * @description 段落
 */
export default function P({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <p>{children}</p>
}
