import type { Section as SectionModel } from "@shared/model"

export default function Section({
  title,
}: Readonly<SectionModel>) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
    </section>
  )
}
