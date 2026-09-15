"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SectionEditDialog({
  open,
  onOpenChange,
  sectionId,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑章节</DialogTitle>
          <DialogDescription>
            id:
            {" "}
            {sectionId}
            {" "}
            · icon / title / part 字段编辑 (后续设计)
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center text-sm text-muted-foreground">
          编辑表单待设计
        </div>
      </DialogContent>
    </Dialog>
  )
}
