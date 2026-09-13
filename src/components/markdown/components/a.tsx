import type { ReactNode } from "react"
import Link from "next/link"

/**
 * @description 锚点
 *
 * 只放行 href, 且协议限 http / https / mailto; 不合法时退化为纯文本, 不产出 a 标签
 */
const SAFE_HREF = /^(?:https?:|mailto:)/i

export default function Anchor({
  attribs,
  children,
}: Readonly<{
  attribs: Record<string, string | undefined>
  children: ReactNode
}>) {
  const href = attribs.href

  return href && SAFE_HREF.test(href)
    ? <Link href={href}>{children}</Link>
    : <>{children}</>
}
