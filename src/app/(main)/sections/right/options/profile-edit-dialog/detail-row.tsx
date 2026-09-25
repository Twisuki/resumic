"use client"

import type { DetailNode } from "@shared/model/node"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconGripVertical, IconTrash } from "@tabler/icons-react"
import { DETAIL_ICON_PLACEHOLDER } from "@/app/(main)/sections/right/options/profile-edit-dialog/constants"
import Icon from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { usePatchInput } from "@/hooks/patch-input"
import { cn } from "@/lib/utils"

/**
 * @description 单条自定义信息: 拖拽手柄 + 图标占位 + 输入框 + 删除
 */
export default function DetailRow({
  id,
  parentId,
}: Readonly<{
  id: string
  parentId: string
}>) {
  const node = useNode(id) as DetailNode | undefined
  const { patch } = useHistory()
  const input = usePatchInput(id, "content", node?.self.content ?? "")

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
      className={cn("flex items-center gap-1.5", sortable.isDragging && "opacity-40")}
    >
      <button
        type="button"
        aria-label="拖拽排序"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
        {...sortable.attributes}
        {...sortable.listeners}
      >
        <IconGripVertical className="size-3.5" />
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled
        title="图标选择待实现"
        aria-label="选择图标"
      >
        <Icon name={DETAIL_ICON_PLACEHOLDER} className="size-3.5" />
      </Button>

      <Input
        placeholder="例如: 个人网站 / 博客"
        className="h-7 text-xs"
        {...input}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground hover:text-destructive"
        aria-label="删除"
        onClick={() => patch.remove(parentId, id)}
      >
        <IconTrash className="size-3.5" />
      </Button>
    </div>
  )
}
