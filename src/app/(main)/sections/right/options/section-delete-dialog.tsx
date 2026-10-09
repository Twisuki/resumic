"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useHistory } from "@/hooks/history"

/**
 * @description 受控的删除章节确认框, 由父组件传入 open/onOpenChange 控制显隐
 */
export default function SectionDeleteDialog({
  open,
  onOpenChange,
  pageId,
  sectionId,
  title,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  pageId: string
  sectionId: string
  title: string
}>) {
  const { patch } = useHistory()

  function confirm() {
    patch.remove(pageId, sectionId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除章节</DialogTitle>
          <DialogDescription>
            确定删除「
            {title || "未命名章节"}
            」吗？此操作不可撤销
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="destructive" onClick={confirm}>删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
