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
       * 显式内容区 wrapper 把裁剪点拉回到我们自己手里, 不依赖 Paper 的 overflow-hidden
       * 在 Chrome 实际行为 (content edge 666 vs padding edge 794 这种非标差异).
       *
       * wrapper = 666×995 (Paper 的内容区), overflow-hidden 裁掉超出.
       * inner flex 居中 (flex justify-center + items-start), transform-origin top center,
       * 缩放后视觉 = (0, 0) to (666, H×zoom), 顶对齐 wrapper, 视觉宽度恒等于内容区.
       * 不管 width 怎么改 (包括 dev tools 手动改), wrapper 把视觉钳到 666.
       */}
      <div
        className="overflow-hidden flex justify-center items-start"
        style={{
          width: `${PAPER_CONTENT_AREA.WIDTH}px`,
          height: `${PAPER_CONTENT_AREA.HEIGHT}px`,
        }}
      >
        <div
          className="flex flex-col gap-6 shrink-0"
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
      </div>
    </Paper>
  )
}
