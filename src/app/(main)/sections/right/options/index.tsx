"use client"

import type { RootNode } from "@shared/model/node"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { IconArrowBackUp, IconArrowForwardUp, IconDeviceFloppy, IconPencil } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import OptionsDragOverlay from "@/app/(main)/sections/right/options/options-drag-overlay"
import PagesList from "@/app/(main)/sections/right/options/pages-list"
import ProfileEditDialog from "@/app/(main)/sections/right/options/profile-edit-dialog"
import { useOptionsDrag } from "@/app/(main)/sections/right/options/use-options-drag"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { useResume } from "@/hooks/resume"

export default function Options() {
  const { resumeRootId } = useResume()
  const root = useNode(resumeRootId ?? "") as RootNode | undefined
  const zoom = root?.self.zoom ?? 1

  const { patch, save, isSaving, undo, redo, canUndo, canRedo } = useHistory()
  const [profileOpen, setProfileOpen] = useState(false)

  const currentId = useResume().id

  function handleSave() {
    if (!currentId) {
      toast.error("没有可保存的简历")
      return
    }
    save()
  }

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
      if (resumeRootId)
        patch.update(resumeRootId, "zoom", v)
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
        <header className="h-12 shrink-0 px-3 flex items-center justify-between text-sm font-semibold">
          <span>简历选项</span>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="撤销"
              title="撤销"
              disabled={!canUndo}
              onClick={undo}
            >
              <IconArrowBackUp className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="重做"
              title="重做"
              disabled={!canRedo}
              onClick={redo}
            >
              <IconArrowForwardUp className="size-4" />
            </Button>
          </div>
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 justify-start gap-2"
              onClick={() => setProfileOpen(true)}
              disabled={!currentId}
            >
              <IconPencil className="size-4" />
              <span>编辑个人信息</span>
            </Button>

            <Button
              className="flex-1 justify-start gap-2"
              onClick={handleSave}
              disabled={!currentId || isSaving}
            >
              <IconDeviceFloppy className="size-4" />
              <span>{isSaving ? "保存中..." : "保存"}</span>
            </Button>
          </div>
        </div>

        <Separator />

        <PagesList drag={drag} />

        <DragOverlay>
          <OptionsDragOverlay />
        </DragOverlay>
      </DndContext>

      <ProfileEditDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  )
}
