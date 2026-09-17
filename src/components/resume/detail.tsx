import type { DetailNode } from "@shared/model/node"
import Icon from "@/components/icon"
import { useNode } from "@/hooks/node"

export default function Detail({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as DetailNode | undefined

  if (!node)
    return null

  const { icon, content } = node.self

  return (
    <div className="flex items-center gap-1">
      <Icon name={icon} className="size-4 shrink-0" />
      <span>{content}</span>
    </div>
  )
}
