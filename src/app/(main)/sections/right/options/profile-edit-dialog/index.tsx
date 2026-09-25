"use client"

import BaseInfo from "@/app/(main)/sections/right/options/profile-edit-dialog/base-info"
import DetailSection from "@/app/(main)/sections/right/options/profile-edit-dialog/detail-section"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useResume } from "@/hooks/resume"

/**
 * @description 编辑个人信息弹窗
 */
export default function ProfileEditDialog({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const { profileRootId } = useResume()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑个人信息</DialogTitle>
        </DialogHeader>

        {profileRootId
          ? (
              <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
                <BaseInfo id={profileRootId} />
                <Separator />
                <DetailSection id={profileRootId} />
              </div>
            )
          : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                未加载简历
              </div>
            )}
      </DialogContent>
    </Dialog>
  )
}
