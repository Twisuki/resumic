import type { Resume, Section as SectionModel } from "@shared/model"
import Profile from "@/app/(main)/sections/main/profile"
import Section from "@/app/(main)/sections/main/section"
import { flatten } from "@/lib/collection"

export default function Main({
  title,
  section,
  ...profile
}: Readonly<Resume>) {
  const sections = flatten<SectionModel>(section)

  return (
    <main className="flex-1 min-w-0 h-full flex flex-col gap-6 overflow-y-auto p-6">
      <Profile {...profile} />
      {sections.map(s => (
        <Section
          key={s.id}
          {...s}
        />
      ))}
    </main>
  )
}
