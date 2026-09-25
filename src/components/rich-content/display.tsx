import { Markdown } from "@/components/markdown"
import { useRichContent } from "@/hooks/rich-content"

export default function RichContent({
  ids,
  className,
}: Readonly<{
  ids: string[]
  className?: string
}>) {
  const source = useRichContent(ids)

  return <Markdown source={source} className={className} />
}
