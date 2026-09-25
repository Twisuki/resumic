"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useHistory } from "@/hooks/history"

/**
 * @description 删除章节确认弹窗
 */
export default function SectionDeleteDialog({
  pageId,
  sectionId,
  title,
  children,
}: Readonly<{
  pageId: string
  sectionId: string
  title: string
  children: ReactNode
}>) {
  const { patch } = useHistory()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

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
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              patch.remove(pageId, sectionId)
              setOpen(false)
            }}
          >
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
