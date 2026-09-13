import type { ReactNode } from "react"

/**
 * @description 行内代码
 */
export default function Code({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <code className="rounded-sm bg-muted px-1 py-0.5">
      {children}
    </code>
  )
}
