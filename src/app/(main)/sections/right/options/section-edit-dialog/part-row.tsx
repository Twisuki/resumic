"use client"

import type { PartNode } from "@shared/model/node"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconGripVertical, IconTrash } from "@tabler/icons-react"
import PatchField from "@/components/patch-field"
import { Button } from "@/components/ui/button"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { cn } from "@/lib/utils"

/**
 * @description 单条经历: 拖拽手柄 + 字段编辑 + 内容占位 + 删除
 */
export default function PartRow({
  id,
  parentId,
}: Readonly<{
  id: string
  parentId: string
}>) {
  const node = useNode(id) as PartNode | undefined
  const { patch } = useHistory()

  const sortable = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

  if (!node)
    return null

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border p-2",
        sortable.isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="拖拽排序"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
          {...sortable.attributes}
          {...sortable.listeners}
        >
          <IconGripVertical className="size-3.5" />
        </button>
        <span className="text-xs font-medium text-muted-foreground">经历</span>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="ml-auto text-muted-foreground hover:text-destructive"
          aria-label="删除"
          onClick={() => patch.remove(parentId, id)}
        >
          <IconTrash className="size-3.5" />
        </Button>
      </div>

      <PatchField
        id={id}
        field="title"
        label="标题"
        placeholder="例如: 某某公司 - 前端工程师"
      />

      <div className="grid grid-cols-2 gap-2">
        <PatchField
          id={id}
          field="subtitle"
          label="副标题"
          placeholder="例如: 本科"
        />
        <PatchField
          id={id}
          field="date"
          label="时间"
          placeholder="例如: 2020.09 - 2024.06"
        />
      </div>

      <PatchField
        id={id}
        field="link"
        label="链接"
        placeholder="例如: https://example.com"
      />

      <div className="rounded-md border border-dashed border-border bg-muted/40 px-2 py-3 text-center text-xs text-muted-foreground">
        内容编辑待实现
      </div>
    </div>
  )
}
