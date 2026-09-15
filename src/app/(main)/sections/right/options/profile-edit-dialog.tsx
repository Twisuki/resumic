"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ProfileEditDialog({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑个人信息</DialogTitle>
          <DialogDescription>name / headline / age / gender / phone / email / detail 字段编辑 (后续设计)</DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center text-sm text-muted-foreground">
          编辑表单待设计
        </div>
      </DialogContent>
    </Dialog>
  )
}
