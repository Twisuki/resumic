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
 *
 * breaks: true 让单个 \n 渲染为行内换行, 与编辑器 `whitespace-pre-wrap` 行为一致;
 * 富内容编辑器现在支持多行 source, 显示端必须把 \n 渲染为换行而不是被浏览器当成空格
 */
function createParser(): MarkdownItInstance {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
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
