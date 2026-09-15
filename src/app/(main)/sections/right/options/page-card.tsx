"use client"

import type { Page as PageModel } from "@shared/model"
import { IconChevronDown, IconGripVertical, IconPlus, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"
import SectionRow from "@/app/(main)/sections/right/options/section-row"
import { Button } from "@/components/ui/button"
import { useHistory } from "@/hooks/history"
import { flatten } from "@/lib/collection"
import { genId } from "@/lib/id"
import { cn } from "@/lib/utils"

export default function PageCard({
  page,
  index,
}: Readonly<{
  page: PageModel
  index: number
}>) {
  const sections = flatten(page.section)
  const [collapsed, setCollapsed] = useState(false)
  const { patch } = useHistory()

  function handleAddSection() {
    patch(
      "item_add",
      ["page", "items", page.id, "section"],
      {
        id: genId(),
        icon: "star",
        title: "新章节",
        part: { items: [], orders: [] },
      },
    )
  }

  function handleDeletePage() {
    if (sections.length > 0) {
      toast.warning("分页内还有章节, 请先删除或移走章节")
      return
    }
    patch("item_remove", ["page"], page.id)
  }

  return (
    <div className="rounded-md border border-sidebar-border bg-card text-card-foreground overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 h-8 border-b border-sidebar-border bg-muted/40">
        <button
          type="button"
          aria-label="拖拽分页"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
        >
          <IconGripVertical className="size-3.5" />
        </button>

        <span className="text-xs font-medium">
          分页
          {index + 1}
        </span>

        <span className="text-xs text-muted-foreground">
          (
          {sections.length}
          )
        </span>

        <div className="ml-auto flex items-center">
          <Button
            variant="destructive"
            size="icon-xs"
            aria-label="删除分页"
            onClick={handleDeletePage}
          >
            <IconTrash className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={collapsed ? "展开" : "折叠"}
            onClick={() => setCollapsed(c => !c)}
            className={cn("transition-transform", collapsed && "-rotate-90")}
          >
            <IconChevronDown className="size-3.5" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-1.5 flex flex-col gap-1">
          {sections.length === 0 && (
            <div className="py-3 text-center text-xs text-muted-foreground">
              还没有章节
            </div>
          )}

          {sections.map(s => (
            <SectionRow
              key={s.id}
              section={s}
            />
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1.5 text-muted-foreground border border-dashed border-sidebar-border hover:text-foreground"
            onClick={handleAddSection}
          >
            <IconPlus className="size-3.5" />
            <span className="text-xs">新增章节</span>
          </Button>
        </div>
      )}
    </div>
  )
}
