"use client"

import type { DragEndEvent } from "@dnd-kit/core"
import type { DetailNode, ProfileNode } from "@shared/model/node"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { IconPlus } from "@tabler/icons-react"
import { DETAIL_ICON_PLACEHOLDER } from "@/app/(main)/sections/right/options/profile-edit-dialog/constants"
import DetailRow from "@/app/(main)/sections/right/options/profile-edit-dialog/detail-row"
import { Button } from "@/components/ui/button"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { genId } from "@/lib/id"

/**
 * @description 自定义信息区: 拖拽排序列表 + 底部固定新增
 */
export default function DetailSection({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as ProfileNode | undefined
  const { patch } = useHistory()
  const detailIds = node?.children ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id)
      return
    const oldIndex = detailIds.indexOf(String(active.id))
    const newIndex = detailIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0)
      return
    patch.reorder(id, arrayMove(detailIds, oldIndex, newIndex))
  }

  function handleAdd() {
    const detail: DetailNode = {
      id: genId(),
      self: { icon: DETAIL_ICON_PLACEHOLDER, content: "" },
      children: [],
    }
    patch.add(id, detail)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">自定义信息</span>
        <span className="text-xs text-muted-foreground">{detailIds.length}</span>
      </div>

      {detailIds.length === 0 && (
        <div className="py-4 text-center text-xs text-muted-foreground">
          还没有自定义信息
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={detailIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {detailIds.map(did => (
              <DetailRow key={did} id={did} parentId={id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        className="sticky bottom-0 w-full justify-start gap-2 border-dashed bg-popover"
        onClick={handleAdd}
      >
        <IconPlus className="size-4" />
        <span className="text-xs">新增信息</span>
      </Button>
    </div>
  )
}
