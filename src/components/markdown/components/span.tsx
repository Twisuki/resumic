import type { CSSProperties, ReactNode } from "react"
import { COLOR_ATTR } from "@/components/markdown/color-rule"
import { SIZE_ATTR, SIZE_MAX, SIZE_MIN } from "@/components/markdown/size-rule"

/**
 * @description 带内联样式的 span, 承接两条自研行内规则产出的 data-color 与 data-size
 *
 * parse 侧已拒非法字符, 这里必须再校验一次才能落进 style, 否则 data 属性是一条 CSS 注入面
 *
 * data-color 与 data-size 原样保留在结果里, 供下游样式或调试使用
 */
const CSS_COLOR = /^(?:[a-z]{1,20}|#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([\d\s,.%/]+\))$/i

const SIZE_NUMBER = /^\d+(?:\.\d+)?$/

function isValidColor(value: string | undefined): value is string {
  return typeof value === "string" && CSS_COLOR.test(value)
}

function isValidSize(value: string | undefined): value is string {
  if (typeof value !== "string" || !SIZE_NUMBER.test(value)) {
    return false
  }
  const size = Number(value)
  return size >= SIZE_MIN && size <= SIZE_MAX
}

export default function Span({
  attribs,
  children,
}: Readonly<{
  attribs: Record<string, string | undefined>
  children: ReactNode
}>) {
  const style: CSSProperties = {}
  const color = attribs[COLOR_ATTR]
  const size = attribs[SIZE_ATTR]

  if (isValidColor(color)) {
    style.color = color
  }
  if (isValidSize(size)) {
    style.fontSize = `${size}em`
  }

  return (
    <span
      style={style}
      data-color={color}
      data-size={size}
    >
      {children}
    </span>
  )
}
