"use client"

import type { Section as SectionModel } from "@shared/model"
import { IconGripVertical, IconPencil } from "@tabler/icons-react"
import { useState } from "react"
import SectionEditDialog from "@/app/(main)/sections/right/options/section-edit-dialog"
import Icon from "@/components/icon"
import { Button } from "@/components/ui/button"

export default function SectionRow({
  section,
}: Readonly<{
  section: SectionModel
}>) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <div className="group flex items-center gap-1.5 rounded-md border border-transparent hover:border-sidebar-border hover:bg-muted/50 px-1.5 py-1">
        {/* drag handle */}
        <button
          type="button"
          aria-label="拖拽章节"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
        >
          <IconGripVertical className="size-3.5" />
        </button>

        {/* icon + title */}
        <Icon
          name={section.icon}
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <span className="min-w-0 flex-1 truncate text-xs">
          {section.title || <span className="text-muted-foreground italic">未命名章节</span>}
        </span>

        {/* edit, hover 显现 */}
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="编辑章节"
          onClick={() => setEditOpen(true)}
          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 shrink-0"
        >
          <IconPencil className="size-3" />
        </Button>
      </div>

      <SectionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        sectionId={section.id}
      />
    </>
  )
}
