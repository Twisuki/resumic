import type { Page as PageModel, Resume as ResumeModel, Section as SectionModel } from "@shared/model"
import Paper from "@/components/resume/paper"
import Profile from "@/components/resume/profile"
import Section from "@/components/resume/section"
import { flatten } from "@/lib/collection"

/**
 * @description 简历组件, 按 page 分 Paper 渲染, Profile 固定首页
 */
export default function Resume({
  scale,
  zoom,
  page,
  ...profile
}: Readonly<{
  scale: number
  zoom: number
} & ResumeModel>) {
  const pages = flatten<PageModel>(page)

  return (
    <div
      className="flex flex-col gap-6 w-full items-center"
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
    >
      {pages.map((p, index) => (
        <Paper key={p.id}>
          <div
            className="flex flex-col gap-6 w-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            {index === 0 && <Profile {...profile} />}
            {flatten<SectionModel>(p.section).map(s => (
              <Section key={s.id} {...s} />
            ))}
          </div>
        </Paper>
      ))}
    </div>
  )
}
