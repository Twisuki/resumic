import type { ReactNode } from "react"

/**
 * @description 有序列表
 *
 * preflight 清掉了 list-style, 所以这里必须显式写 list-decimal 与 pl-5
 */
export default function Ol({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <ol className="list-decimal space-y-2 pl-5">{children}</ol>
}
