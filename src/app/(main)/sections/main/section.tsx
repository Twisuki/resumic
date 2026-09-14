import type { Section as SectionModel } from "@shared/model"
import Part from "@/app/(main)/sections/main/part"
import Icon from "@/components/icon"
import { flatten } from "@/lib/collection"

export default function Section({
  icon,
  title,
  part,
}: Readonly<SectionModel>) {
  const parts = flatten(part)

  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-center gap-2 border-b border-border pb-2">
        <Icon name={icon} className="size-6 shrink-0" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </header>

      {parts.map(p => (
        <Part
          key={p.id}
          {...p}
        />
      ))}
    </section>
  )
}
