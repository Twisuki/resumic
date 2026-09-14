import type { Resume as ResumeModel, Section as SectionModel } from "@shared/model"
import Profile from "@/components/resume/profile"
import Section from "@/components/resume/section"
import { flatten } from "@/lib/collection"

/**
 * @description 简历内容画布, 严格无响应式, 大小由外层 Paper 锁死, zoom 调整内部字号缩放
 */
export default function Resume({
  zoom,
  section,
  ...profile
}: Readonly<{
  zoom: number
} & ResumeModel>) {
  const sections = flatten<SectionModel>(section)

  return (
    <div
      className="flex flex-col gap-6 w-full"
      style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
    >
      <Profile {...profile} />
      {sections.map(s => (
        <Section key={s.id} {...s} />
      ))}
    </div>
  )
}
