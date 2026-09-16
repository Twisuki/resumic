"use client"

import type { Page as PageModel } from "@shared/model"
import type { DragState } from "@/app/(main)/sections/right/options/use-options-drag"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconChevronDown, IconGripVertical, IconPlus, IconTrash } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
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
  drag,
}: Readonly<{
  page: PageModel
  index: number
  drag: DragState
}>) {
  const sections = flatten(page.section)
  const sectionSortableIds = sections.map(s => `section:${s.id}`)
  const [collapsed, setCollapsed] = useState(false)

  // 跨 page 拖入: 检测 sections 增长, 折叠页自动展开让用户看到新章节
  const prevSectionCountRef = useRef(sections.length)
  useEffect(() => {
    if (sections.length > prevSectionCountRef.current) {
      setCollapsed(false)
    }
    prevSectionCountRef.current = sections.length
  }, [sections.length])
  const { patch } = useHistory()

  const sortable = useSortable({
    id: `page:${page.id}`,
    data: { type: "page", pageId: page.id, page, index },
  })

  // 拖 section 中且不是源 page → 所有目标 page 都直接显示接收蒙版
  const isReceiving
    = drag.activeType === "section"
      && drag.sourcePageId !== null
      && drag.sourcePageId !== page.id

  const droppable = useDroppable({
    id: `page-receive:${page.id}`,
    disabled: !isReceiving,
    data: { type: "page-receive", pageId: page.id },
  })

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

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
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "relative",
        sortable.isDragging && "opacity-40",
      )}
    >
      <div className="rounded-md border border-sidebar-border bg-card text-card-foreground overflow-hidden">
        <div className="flex items-center gap-1.5 px-2 h-8 border-b border-sidebar-border bg-muted/40">
          <button
            type="button"
            aria-label="拖拽分页"
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
            {...sortable.attributes}
            {...sortable.listeners}
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

            {sections.length > 0 && (
              <SortableContext items={sectionSortableIds} strategy={verticalListSortingStrategy}>
                {sections.map(s => (
                  <SectionRow
                    key={s.id}
                    section={s}
                    pageId={page.id}
                  />
                ))}
              </SortableContext>
            )}

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

      {/* 接收态蒙版: 拖 section 中且非源 page, 所有 page 都展示 */}
      {isReceiving && (
        collapsed
          ? (
              <div
                ref={droppable.setNodeRef}
                className="absolute inset-0 z-10 rounded-md border-2 border-dashed border-primary pointer-events-none flex items-center justify-center bg-primary/10"
              >
                <span className="text-xs font-medium text-primary">
                  拖动加入
                </span>
              </div>
            )
          : (
              <div
                ref={droppable.setNodeRef}
                className={cn(
                  "absolute inset-0 z-10 rounded-md border-2 border-dashed flex items-center justify-center transition-colors",
                  "border-primary bg-primary/10 backdrop-blur-[2px]",
                  droppable.isOver && "bg-primary/20 border-solid",
                )}
              >
                <span className="text-xs font-medium text-primary">
                  拖动加入
                </span>
              </div>
            )
      )}
    </div>
  )
}
