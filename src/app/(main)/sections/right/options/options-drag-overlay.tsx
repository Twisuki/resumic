"use client"

import type { PageNode, SectionNode } from "@shared/model/node"
import type { DragType } from "@/app/(main)/sections/right/options/use-options-drag"
import { useDndContext } from "@dnd-kit/core"
import { IconGripVertical } from "@tabler/icons-react"
import Icon from "@/components/icon"
import { useNode } from "@/hooks/node"
import { cn } from "@/lib/utils"

interface DragData {
  type?: DragType
  id?: string
  pageId?: string
  index?: number
}

export default function OptionsDragOverlay() {
  const { active } = useDndContext()
  if (!active)
    return null

  const data = active.data.current as DragData | undefined
  if (!data?.type || !data.id)
    return null

  if (data.type === "page") {
    return <PagePreview id={data.id} index={data.index ?? 0} />
  }
  if (data.type === "section") {
    return <SectionPreview id={data.id} />
  }
  return null
}

function PagePreview({ id, index }: { id: string, index: number }) {
  const node = useNode(id) as PageNode | undefined
  const sectionCount = node?.children.length ?? 0

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
          {index + 1}
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

function SectionPreview({ id }: { id: string }) {
  const node = useNode(id) as SectionNode | undefined

  if (!node)
    return null

  const { icon, title } = node.self

  return (
    <div className={cn(
      "rounded-md border border-sidebar-border bg-card text-card-foreground shadow-xl",
      "flex items-center gap-1.5 px-1.5 py-1 min-w-50 cursor-grabbing",
    )}
    >
      <IconGripVertical className="size-3.5 text-muted-foreground shrink-0" />
      <Icon
        name={icon}
        className="size-3.5 shrink-0 text-muted-foreground"
      />
      <span className="min-w-0 flex-1 truncate text-xs">
        {title || <span className="text-muted-foreground italic">未命名章节</span>}
      </span>
    </div>
  )
}
