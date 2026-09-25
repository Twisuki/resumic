"use client"

import BaseInfo from "@/app/(main)/sections/right/options/section-edit-dialog/base-info"
import PartSection from "@/app/(main)/sections/right/options/section-edit-dialog/part-section"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

/**
 * @description 编辑章节弹窗
 */
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
      <DialogContent className="sm:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑章节</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <BaseInfo id={sectionId} />
          <Separator />
          <PartSection id={sectionId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
