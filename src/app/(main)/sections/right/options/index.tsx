"use client"

import { DndContext, DragOverlay } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { IconPencil } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import OptionsDragOverlay from "@/app/(main)/sections/right/options/options-drag-overlay"
import PagesList from "@/app/(main)/sections/right/options/pages-list"
import ProfileEditDialog from "@/app/(main)/sections/right/options/profile-edit-dialog"
import { useOptionsDrag } from "@/app/(main)/sections/right/options/use-options-drag"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useHistory } from "@/hooks/history"
import { useResumeStore } from "@/stores/resume"

export default function Options() {
  const zoom = useResumeStore(s => s.current?.zoom ?? 1)
  const { patch } = useHistory()
  const [profileOpen, setProfileOpen] = useState(false)

  const {
    drag,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useOptionsDrag()

  // slider 视觉跟手, 写 store 防抖; 切简历时同步
  const [localZoom, setLocalZoom] = useState(zoom)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- 切简历 / 外部 zoom 变化时同步本地状态, 受控组件标准模式
    setLocalZoom(zoom)
  }, [zoom])

  useEffect(() => () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  }, [])

  function handleZoomChange(v: number) {
    setLocalZoom(v)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      patch("field_set", ["zoom"], v)
    }, 150)
  }

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col bg-sidebar text-sidebar-foreground overflow-y-auto no-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <header className="h-12 shrink-0 px-3 flex items-center text-sm font-semibold">
          简历选项
        </header>

        <div className="shrink-0 p-3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">缩放</span>
              <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                {Math.round(localZoom * 100)}
                %
              </span>
            </div>
            <Slider
              min={0.5}
              max={2}
              step={0.05}
              value={[localZoom]}
              onValueChange={([v]) => handleZoomChange(v)}
            />
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setProfileOpen(true)}
          >
            <IconPencil className="size-4" />
            <span>编辑个人信息</span>
          </Button>
        </div>

        <Separator />

        <PagesList drag={drag} />

        <DragOverlay>
          <OptionsDragOverlay />
        </DragOverlay>

        <ProfileEditDialog open={profileOpen} onOpenChange={setProfileOpen} />
      </DndContext>
    </div>
  )
}
