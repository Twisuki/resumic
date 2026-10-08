import type { PageNode } from "@shared/model/node"
import Paper from "@/components/resume/paper"
import Profile from "@/components/resume/profile"
import Section from "@/components/resume/section"
import { PAPER } from "@/config/paper"
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
    <Paper className="p-0 justify-start">
      {/*
       * 反向系数 + 各向同性缩放: layout 宽度 = PAPER.WIDTH / zoom,
       * transform: scale(zoom) 后视觉宽度 = PAPER.WIDTH, 字号 / 间距 / 图片同比例缩小.
       * transform-origin 必须 top left: top center 会让视觉中心跑到 Paper 外面.
       * Paper 用 p-0 justify-start 覆盖默认的 padding 和居中, 否则 layout 宽度算的是 Paper 内 666 的内容区.
       */}
      <div
        className="flex flex-col gap-6"
        style={{
          width: `${PAPER.WIDTH / zoom}px`,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
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
