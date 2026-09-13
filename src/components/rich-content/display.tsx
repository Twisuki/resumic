import type { Content } from "@shared/model"
import Markdown from "@/components/markdown/display"
import { serializeContent } from "@/components/rich-content/serialize"

/**
 * @description 富文本展示组件, 吃 Content 结构, 序列化成 md 字符串后交给 markdown 层渲染
 */
export default function RichContent({
  value,
  className,
}: Readonly<{
  value: Content
  className?: string
}>) {
  return <Markdown source={serializeContent(value)} className={className} />
}
