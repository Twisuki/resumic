"use client"

import type { ProfileNode } from "@shared/model/node"
import { IconUser, IconX } from "@tabler/icons-react"
import Image from "next/image"
import { useState } from "react"
import AvatarPickerDialog from "@/app/(main)/sections/right/options/profile-edit-dialog/avatar-picker-dialog"
import { Button } from "@/components/ui/button"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { cn } from "@/lib/utils"

/**
 * @description BaseInfo 里的头像区块: 当前头像预览 + "选择头像"/"移除头像"按钮, 点击触发 Picker 弹窗
 */
export default function AvatarSection({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as ProfileNode | undefined
  const { patch } = useHistory()
  const [pickerOpen, setPickerOpen] = useState(false)

  const avatar = node?.self.avatar ?? ""

  function handlePick(url: string) {
    patch.update(id, "avatar", url)
  }

  function handleClear() {
    patch.update(id, "avatar", "")
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        aria-label="选择头像"
        className={cn(
          "flex w-14 h-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted",
          "transition-colors hover:border-foreground/30 focus-visible:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        {avatar
          ? (
              <Image
                src={avatar}
                alt={node?.self.name || "头像"}
                width={56}
                height={64}
                className="size-full object-cover"
              />
            )
          : <IconUser className="size-5 text-muted-foreground" />}
      </button>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">头像</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setPickerOpen(true)}
          >
            选择头像
          </Button>
          {avatar && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              aria-label="移除头像"
              onClick={handleClear}
            >
              <IconX className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <AvatarPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currentAvatar={avatar}
        onPick={handlePick}
      />
    </div>
  )
}
