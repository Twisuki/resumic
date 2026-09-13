import type { DOMNode, HTMLReactParserOptions } from "html-react-parser"
import type { CSSProperties, JSX } from "react"
import htmlParser, { domToReact } from "html-react-parser"
import Link from "next/link"
import { COLOR_ATTR } from "@/components/markdown/color-rule"
import { SIZE_ATTR, SIZE_MAX, SIZE_MIN } from "@/components/markdown/size-rule"

/**
 * @description 丢弃整棵子树的标签
 */
const DISCARDED = new Set(["img", "table", "pre", "script", "style", "iframe"])

/**
 * @description a[href] 的协议白名单
 */
const SAFE_HREF = /^(?:https?:|mailto:)/i

/**
 * @description 合法 CSS 颜色: 命名色 / hex / rgb() / hsl()
 */
const CSS_COLOR = /^(?:[a-z]{1,20}|#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([\d\s,.%/]+\))$/i

/**
 * @description 纯数字
 */
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

/**
 * @description 子节点继续交给同一套 options 过滤; Element['children'] 含 CDATA, 实际不会出现
 */
function childrenOf(domNode: DOMNode, options: HTMLReactParserOptions) {
  return domToReact((domNode as { children: DOMNode[] }).children, options)
}

/**
 * @description 白名单分发. **必须返回合法 React 元素** —— 返回非元素会被 html-react-parser
 * 当作"未替换"而走默认渲染(原生标签 + 原生属性), 白名单即失效
 */
function replaceNode(domNode: DOMNode, options: HTMLReactParserOptions): JSX.Element | undefined {
  // 文本 / 注释 / 指令: 返回非元素走默认处理, 对文本正是所需
  if (domNode.type !== "tag" && domNode.type !== "script" && domNode.type !== "style") {
    return undefined
  }

  const name = domNode.name.toLowerCase()

  if (DISCARDED.has(name)) {
    return <></>
  }

  const children = childrenOf(domNode, options)

  switch (name) {
    case "p":
      return <p>{children}</p>
    case "br":
      return <br />
    case "hr":
      return <hr />
    case "strong":
      return <strong>{children}</strong>
    case "em":
      return <em>{children}</em>
    case "s":
    case "del":
      return <s>{children}</s>
    case "code":
      return <code>{children}</code>
    case "blockquote":
      return <blockquote>{children}</blockquote>
    case "ul":
      return <ul className="list-disc pl-5">{children}</ul>
    case "ol":
      return <ol className="list-decimal pl-5">{children}</ol>
    case "li":
      return <li>{children}</li>
    // 标题层级归 Section 所有, 富文本里的标题只保留强调, 不抢字号
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return <p className="font-bold">{children}</p>
    case "a": {
      const href = domNode.attribs?.href
      return href && SAFE_HREF.test(href)
        ? <Link href={href}>{children}</Link>
        : <>{children}</>
    }
    case "span": {
      const style: CSSProperties = {}
      const color = domNode.attribs?.[COLOR_ATTR]
      const size = domNode.attribs?.[SIZE_ATTR]
      if (isValidColor(color)) {
        style.color = color
      }
      if (isValidSize(size)) {
        style.fontSize = `${size}em`
      }
      return <span style={style}>{children}</span>
    }
    default:
      return <>{children}</>
  }
}

const OPTIONS: HTMLReactParserOptions = {
  replace: domNode => replaceNode(domNode, OPTIONS),
}

/**
 * @description html 字符串 → react dom, 白名单 switch
 */
export default function RenderHtml({
  html,
}: Readonly<{
  html: string
}>) {
  return <>{htmlParser(html, OPTIONS)}</>
}
