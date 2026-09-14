import type { Resume as ResumeModel, Section as SectionModel } from "@shared/model"
import Profile from "@/components/resume/profile"
import Section from "@/components/resume/section"
import { flatten } from "@/lib/collection"

/**
 * @description 简历内容组件
 */
export default function Resume({
  section,
  ...profile
}: Readonly<ResumeModel>) {
  const sections = flatten<SectionModel>(section)

  return (
    <div className="flex flex-col gap-6 p-16">
      <Profile {...profile} />
      {sections.map(s => (
        <Section
          key={s.id}
          {...s}
        />
      ))}
    </div>
  )
}
