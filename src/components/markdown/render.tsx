import type { DOMNode, HTMLReactParserOptions } from "html-react-parser"
import type { JSX } from "react"
import htmlParser, { domToReact } from "html-react-parser"
import A from "@/components/markdown/components/a"
import Blockquote from "@/components/markdown/components/blockquote"
import Br from "@/components/markdown/components/br"
import Code from "@/components/markdown/components/code"
import Em from "@/components/markdown/components/em"
import Heading from "@/components/markdown/components/heading"
import Hr from "@/components/markdown/components/hr"
import Li from "@/components/markdown/components/li"
import Ol from "@/components/markdown/components/ol"
import P from "@/components/markdown/components/p"
import S from "@/components/markdown/components/s"
import Span from "@/components/markdown/components/span"
import Strong from "@/components/markdown/components/strong"
import Ul from "@/components/markdown/components/ul"

/**
 * @description 丢弃整棵子树的标签
 */
const DISCARDED = new Set(["img", "table", "pre", "script", "style", "iframe"])

/**
 * @description 子节点继续交给同一套 options 过滤; Element['children'] 含 CDATA, 实际不会出现
 */
function childrenOf(domNode: DOMNode, options: HTMLReactParserOptions) {
  return domToReact((domNode as { children: DOMNode[] }).children, options)
}

/**
 * @description 白名单分发, 各标签的具体实现见 components/ 下的同名文件
 *
 * 必须返回合法 React 元素, 返回非元素会被 html-react-parser 当作未替换而走默认渲染
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
      return <P>{children}</P>
    case "br":
      return <Br />
    case "hr":
      return <Hr />
    case "strong":
      return <Strong>{children}</Strong>
    case "em":
      return <Em>{children}</Em>
    case "s":
    case "del":
      return <S>{children}</S>
    case "code":
      return <Code>{children}</Code>
    case "blockquote":
      return <Blockquote>{children}</Blockquote>
    case "ul":
      return <Ul>{children}</Ul>
    case "ol":
      return <Ol>{children}</Ol>
    case "li":
      return <Li>{children}</Li>
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return <Heading level={Number(name.slice(1))}>{children}</Heading>
    case "a":
      return <A attribs={domNode.attribs}>{children}</A>
    case "span":
      return <Span attribs={domNode.attribs}>{children}</Span>
    default:
      return <>{children}</>
  }
}

const OPTIONS: HTMLReactParserOptions = {
  replace: domNode => replaceNode(domNode, OPTIONS),
}

/**
 * @description 把 html 字符串渲染为 react dom, 走白名单 switch
 */
export default function RenderHtml({
  html,
}: Readonly<{
  html: string
}>) {
  return <>{htmlParser(html, OPTIONS)}</>
}
