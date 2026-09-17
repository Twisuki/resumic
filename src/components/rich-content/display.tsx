import type { LineNode } from "@shared/model/node"
import Markdown from "@/components/markdown/display"
import { useResumeStore } from "@/stores/resume"

export default function RichContent({
  ids,
  className,
}: Readonly<{
  ids: string[]
  className?: string
}>) {
  const trees = useResumeStore.getState()

  const source = ids
    .map((id) => {
      const node = trees.profile?.nodes.get(id) ?? trees.resume?.nodes.get(id)
      return (node as LineNode | undefined)?.self.content ?? ""
    })
    .join("")

  return <Markdown source={source} className={className} />
}
