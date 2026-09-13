import type { Section as SectionModel } from "@shared/model"
import { IconAlertCircle } from "@tabler/icons-react"
import Part from "@/app/(main)/sections/main/part"

export default function Section({
  title,
  parts,
}: Readonly<SectionModel>) {
  return (
    <section className="flex flex-col">
      <header className="flex items-center gap-2 border-b border-border pb-2">
        <IconAlertCircle className="size-6 shrink-0" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </header>

      <div className="flex flex-col gap-4 pt-3">
        {parts.map((part, index) => (
          <Part
            key={index}
            {...part}
          />
        ))}
      </div>
    </section>
  )
}
