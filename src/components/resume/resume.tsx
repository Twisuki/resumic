import type { RootNode } from "@shared/model/node"
import Page from "@/components/resume/page"
import { useNode } from "@/hooks/node"
import { useResume } from "@/hooks/resume"

export default function Resume({
  scale,
}: Readonly<{
  scale: number
}>) {
  const { resumeRootId } = useResume()
  const root = useNode(resumeRootId ?? "") as RootNode | undefined

  const pageIds = root?.children ?? []
  const zoom = root?.self.zoom ?? 1

  return (
    <div
      className="flex flex-col gap-6 w-full items-center"
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
    >
      {pageIds.map((id, index) => (
        <Page
          key={id}
          id={id}
          hasProfile={index === 0}
          zoom={zoom}
        />
      ))}
    </div>
  )
}
