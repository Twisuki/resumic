import type { PageNode } from "@shared/model/node"
import Paper from "@/components/resume/paper"
import Profile from "@/components/resume/profile"
import Section from "@/components/resume/section"
import { PAPER_CONTENT_AREA } from "@/config/paper"
import { useNode } from "@/hooks/node"

export default function Page({
  id,
  hasProfile,
  zoom,
}: Readonly<{
  id: string
  hasProfile: boolean
  zoom: number
}>) {
  const node = useNode(id) as PageNode | undefined

  if (!node)
    return null

  const sectionIds = node.children

  return (
    <Paper>
      {/*
       * 反向系数 + 各向同性缩放: layout 宽度 = PAPER_CONTENT_AREA.WIDTH / zoom,
       * transform: scale(zoom) 后视觉宽度恒等于内容区宽度 (666),
       * 字号 / 间距 / 图片同比例缩小. 不侵占 Paper 的 padding.
       *
       * transform-origin: top center 保持原版: flex justify-center 让内容 layout 居中,
       * 缩放围绕布局中心进行, 视觉中心不变 → 视觉始终对齐内容区中心.
       */}
      <div
        className="flex flex-col gap-6"
        style={{
          width: `${PAPER_CONTENT_AREA.WIDTH / zoom}px`,
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
        }}
      >
        {hasProfile && <Profile />}
        {sectionIds.map(id => (
          <Section key={id} id={id} />
        ))}
      </div>
    </Paper>
  )
}
