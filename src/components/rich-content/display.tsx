import type { RichContent as RichContentModel } from "@shared/model"
import Markdown from "@/components/markdown/display"
import { flatten } from "@/lib/collection"

/**
 * @description 富文本展示组件, 接收 RichContent Collection 结构, flatten 展平后传入 markdown 层渲染
 */
export default function RichContent({
  value,
  className,
}: Readonly<{
  value: RichContentModel
  className?: string
}>) {
  return <Markdown source={flatten(value).map(line => line.content).join("")} className={className} />
}
