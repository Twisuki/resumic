"use client"

import type { PageNode, RootNode } from "@shared/model/node"
import type { DragState } from "@/app/(main)/sections/right/options/use-options-drag"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { IconPlus } from "@tabler/icons-react"
import PageCard from "@/app/(main)/sections/right/options/page-card"
import { Button } from "@/components/ui/button"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { useResume } from "@/hooks/resume"
import { genId } from "@/lib/id"

export default function PagesList({ drag }: Readonly<{ drag: DragState }>) {
  const { resumeRootId } = useResume()
  const root = useNode(resumeRootId ?? "") as RootNode | undefined
  const pageIds = root?.children ?? []
  const sortableIds = pageIds.map(pid => `page:${pid}`)

  const { patch } = useHistory()

  function handleAddPage() {
    if (!resumeRootId)
      return
    const newPage: PageNode = {
      id: genId(),
      self: null,
      children: [],
    }
    patch.add(resumeRootId, newPage)
  }

  return (
    <div className="p-2 flex flex-col gap-2">
      {!resumeRootId && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          未加载简历
        </div>
      )}

      {resumeRootId && pageIds.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          还没有分页, 点下方"新建分页"
        </div>
      )}

      {pageIds.length > 0 && (
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {pageIds.map((pid, i) => (
            <PageCard
              key={pid}
              id={pid}
              index={i}
              drag={drag}
            />
          ))}
        </SortableContext>
      )}

      {resumeRootId && (
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-dashed text-muted-foreground"
          onClick={handleAddPage}
        >
          <IconPlus className="size-4" />
          <span>新建分页</span>
        </Button>
      )}
    </div>
  )
}
