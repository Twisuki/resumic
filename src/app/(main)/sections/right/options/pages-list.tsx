"use client"

import type { DragState } from "@/app/(main)/sections/right/options/use-options-drag"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { IconPlus } from "@tabler/icons-react"
import PageCard from "@/app/(main)/sections/right/options/page-card"
import { Button } from "@/components/ui/button"
import { useHistory } from "@/hooks/history"
import { flatten } from "@/lib/collection"
import { genId } from "@/lib/id"
import { useResumeStore } from "@/stores/resume"

export default function PagesList({ drag }: Readonly<{ drag: DragState }>) {
  const resume = useResumeStore(s => s.current)
  const pages = resume ? flatten(resume.page) : []
  const { patch } = useHistory()

  // 用 string[] 喂给 SortableContext (dnd-kit 要求 UniqueIdentifier[])
  const sortableIds = pages.map(p => `page:${p.id}`)

  function handleAddPage() {
    patch("item_add", ["page"], {
      id: genId(),
      section: { items: [], orders: [] },
    })
  }

  return (
    <div className="p-2 flex flex-col gap-2">
      {!resume && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          未加载简历
        </div>
      )}

      {resume && pages.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          还没有分页, 点下方"新建分页"
        </div>
      )}

      {pages.length > 0 && (
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {pages.map((page, i) => (
            <PageCard
              key={page.id}
              page={page}
              index={i}
              drag={drag}
            />
          ))}
        </SortableContext>
      )}

      {resume && (
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
