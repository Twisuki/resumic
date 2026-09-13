import { parse } from "@/components/markdown/parse"
import RenderHtml from "@/components/markdown/render"

/**
 * @description markdown 展示组件, 只认 md 字符串
 */
export default function Markdown({
  source,
  className,
}: Readonly<{
  source: string
  className?: string
}>) {
  return (
    <div className={className}>
      <RenderHtml html={parse(source)} />
    </div>
  )
}
