import type { MarkdownIt as MarkdownItInstance } from "markdown-it"
import MarkdownIt from "markdown-it"
import { colorRule } from "@/components/markdown/color-rule"
import { sizeRule } from "@/components/markdown/size-rule"

/**
 * @description markdown-it 插件
 */
type Plugin = (md: MarkdownItInstance) => void

/**
 * @description 自定义规则的注册位
 */
const PLUGINS: Plugin[] = [colorRule, sizeRule]

/**
 * @description 装配 markdown-it, 接入自定义解析能力
 */
function createParser(): MarkdownItInstance {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false,
    typographer: false,
  })

  for (const plugin of PLUGINS) {
    md.use(plugin)
  }

  return md
}

const md = createParser()

/**
 * @description 解析 md 字符串为 html 字符串
 */
export function parse(source: string): string {
  return md.render(source)
}
