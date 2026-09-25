"use client"

import type { DragEndEvent } from "@dnd-kit/core"
import type { PartNode, SectionNode } from "@shared/model/node"
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
import PartRow from "@/app/(main)/sections/right/options/section-edit-dialog/part-row"
import { Button } from "@/components/ui/button"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { genId } from "@/lib/id"

/**
 * @description 经历区: 拖拽排序列表 + 底部固定新增
 */
export default function PartSection({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as SectionNode | undefined
  const { patch } = useHistory()
  const partIds = node?.children ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id)
      return
    const oldIndex = partIds.indexOf(String(active.id))
    const newIndex = partIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0)
      return
    patch.reorder(id, arrayMove(partIds, oldIndex, newIndex))
  }

  function handleAdd() {
    const part: PartNode = {
      id: genId(),
      self: { title: "", subtitle: "", link: "", date: "" },
      children: [],
    }
    patch.add(id, part)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">经历</span>
        <span className="text-xs text-muted-foreground">{partIds.length}</span>
      </div>

      {partIds.length === 0 && (
        <div className="py-4 text-center text-xs text-muted-foreground">
          还没有经历
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={partIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {partIds.map(pid => (
              <PartRow key={pid} id={pid} parentId={id} />
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
        <span className="text-xs">新增经历</span>
      </Button>
    </div>
  )
}
