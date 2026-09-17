import type { SectionNode } from "@shared/model/node"
import Icon from "@/components/icon"
import Part from "@/components/resume/part"
import { useNode } from "@/hooks/node"

export default function Section({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as SectionNode | undefined

  if (!node)
    return null

  const { icon, title } = node.self
  const partIds = node.children

  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-center gap-2 border-b border-border pb-2">
        <Icon name={icon} className="size-6 shrink-0" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </header>

      {partIds.map(id => (
        <Part key={id} id={id} />
      ))}
    </section>
  )
}
