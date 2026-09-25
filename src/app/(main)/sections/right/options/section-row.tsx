"use client"

import type { SectionNode } from "@shared/model/node"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconGripVertical, IconPencil, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import SectionDeleteDialog from "@/app/(main)/sections/right/options/section-delete-dialog"
import SectionEditDialog from "@/app/(main)/sections/right/options/section-edit-dialog"
import Icon from "@/components/icon"
import { Button } from "@/components/ui/button"
import { useNode } from "@/hooks/node"
import { cn } from "@/lib/utils"

export default function SectionRow({
  id,
  pageId,
}: Readonly<{
  id: string
  pageId: string
}>) {
  const node = useNode(id) as SectionNode | undefined
  const [editOpen, setEditOpen] = useState(false)

  const sortable = useSortable({
    id: `section:${id}`,
    data: { type: "section", pageId, id },
  })

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

  if (!node)
    return null

  const { icon, title } = node.self

  return (
    <>
      <div
        ref={sortable.setNodeRef}
        style={style}
        className={cn(
          "group flex items-center gap-1.5 rounded-md border border-transparent hover:border-sidebar-border hover:bg-muted/50 px-1.5 py-1",
          sortable.isDragging && "opacity-30",
        )}
      >
        <button
          type="button"
          aria-label="拖拽章节"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
          {...sortable.attributes}
          {...sortable.listeners}
        >
          <IconGripVertical className="size-3.5" />
        </button>

        <Icon
          name={icon}
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 flex-1 truncate text-xs">
          {title || <span className="text-muted-foreground italic">未命名章节</span>}
        </span>

        <div className="flex shrink-0 items-center gap-0.5">
          <SectionDeleteDialog
            pageId={pageId}
            sectionId={id}
            title={title}
          >
            <Button
              variant="destructive"
              size="icon-xs"
              aria-label="删除章节"
            >
              <IconTrash className="size-3.5" />
            </Button>
          </SectionDeleteDialog>

          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="编辑章节"
            onClick={() => setEditOpen(true)}
          >
            <IconPencil className="size-3.5" />
          </Button>
        </div>
      </div>

      <SectionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        sectionId={id}
      />
    </>
  )
}
