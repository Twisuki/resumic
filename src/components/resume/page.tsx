import type { PageNode } from "@shared/model/node"
import Paper from "@/components/resume/paper"
import Profile from "@/components/resume/profile"
import Section from "@/components/resume/section"
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
      <div
        className="flex flex-col gap-6 w-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
      >
        {hasProfile && <Profile />}
        {sectionIds.map(id => (
          <Section key={id} id={id} />
        ))}
      </div>
    </Paper>
  )
}
