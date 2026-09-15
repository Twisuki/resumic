"use client"

import { IconPlus } from "@tabler/icons-react"
import PageCard from "@/app/(main)/sections/right/options/page-card"
import { Button } from "@/components/ui/button"
import { flatten } from "@/lib/collection"
import { useResumeStore } from "@/stores/resume"

export default function PagesList() {
  const resume = useResumeStore(s => s.current)
  const pages = resume ? flatten(resume.page) : []

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

      {pages.map((page, i) => (
        <PageCard
          key={page.id}
          page={page}
          index={i}
        />
      ))}

      {resume && (
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-dashed text-muted-foreground"
          // TODO: 接 useHistoryStore().patch('item_add', ['page'], { id: nanoid(), section: { items: [], orders: [] } })
        >
          <IconPlus className="size-4" />
          <span>新建分页</span>
        </Button>
      )}
    </div>
  )
}
