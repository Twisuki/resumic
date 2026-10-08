import { Markdown } from "@/components/markdown"
import { useRichContent } from "@/hooks/rich-content"

export default function RichContent({
  ids,
  className,
  hideIfEmpty,
}: Readonly<{
  ids: string[]
  className?: string
  /**
   * @description 内容全空 (trim 后为空) 时直接返回 null, 用于展示页避免渲染空块
   * 编辑弹窗不传, 总是渲染 (空内容也要保留编辑入口)
   */
  hideIfEmpty?: boolean
}>) {
  const source = useRichContent(ids)

  if (hideIfEmpty && source.trim() === "")
    return null

  return <Markdown source={source} className={className} />
}
