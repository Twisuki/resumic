"use client"

import type { Page as PageModel, Section as SectionModel } from "@shared/model"
import type { DragType } from "@/app/(main)/sections/right/options/use-options-drag"
import { useDndContext } from "@dnd-kit/core"
import { IconGripVertical } from "@tabler/icons-react"
import Icon from "@/components/icon"
import { cn } from "@/lib/utils"

interface DragData {
  type?: DragType
  page?: PageModel
  section?: SectionModel
  pageId?: string
}

/**
 * @description DragOverlay 内容: 根据 active.data.current.type 分发 page/section 预览
 */
export default function OptionsDragOverlay() {
  const { active } = useDndContext()
  if (!active)
    return null

  const data = active.data.current as DragData | undefined
  if (!data?.type)
    return null

  if (data.type === "page" && data.page) {
    return <PagePreview page={data.page} />
  }
  if (data.type === "section" && data.section) {
    return <SectionPreview section={data.section} />
  }
  return null
}

function PagePreview({ page }: { page: PageModel }) {
  const sectionCount = page.section.orders.length
  return (
    <div className={cn(
      "rounded-md border border-sidebar-border bg-card text-card-foreground shadow-xl",
      "cursor-grabbing",
    )}
    >
      <div className="flex items-center gap-1.5 px-2 h-8 border-b border-sidebar-border bg-muted/40 rounded-t-md">
        <IconGripVertical className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">
          分页
        </span>
        <span className="text-xs text-muted-foreground">
          (
          {sectionCount}
          )
        </span>
      </div>
    </div>
  )
}

function SectionPreview({ section }: { section: SectionModel }) {
  return (
    <div className={cn(
      "rounded-md border border-sidebar-border bg-card text-card-foreground shadow-xl",
      "flex items-center gap-1.5 px-1.5 py-1 min-w-50 cursor-grabbing",
    )}
    >
      <IconGripVertical className="size-3.5 text-muted-foreground shrink-0" />
      <Icon
        name={section.icon}
        className="size-3.5 shrink-0 text-muted-foreground"
      />
      <span className="min-w-0 flex-1 truncate text-xs">
        {section.title || <span className="text-muted-foreground italic">未命名章节</span>}
      </span>
    </div>
  )
}
