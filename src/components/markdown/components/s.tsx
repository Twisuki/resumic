import type { ReactNode } from "react"

/**
 * @description 删除线, 同时承接 s 与 del 两种标签
 */
export default function S({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <s>{children}</s>
}
