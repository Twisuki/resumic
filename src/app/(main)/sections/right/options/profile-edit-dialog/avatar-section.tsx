"use client"

import type { ProfileNode } from "@shared/model/node"
import type { ChangeEvent } from "react"
import { IconUser, IconX } from "@tabler/icons-react"
import Image from "next/image"
import { useRef, useState } from "react"
import AvatarPickerDialog from "@/app/(main)/sections/right/options/profile-edit-dialog/avatar-picker-dialog"
import ImageEditor from "@/components/image-editor"
import { Button } from "@/components/ui/button"
import { AVATAR_CONTENT_TYPES, AVATAR_MAX_BYTES } from "@/config/avatar"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { t } from "@/lib/toast"
import { isTrialMode } from "@/lib/trial-mode"
import { cn } from "@/lib/utils"

/**
 * @description BaseInfo 里的头像区块: trial 走 file input / FileReader → data URL 写编辑树; remote 走槽位 Picker 弹窗
 */
export default function AvatarSection({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as ProfileNode | undefined
  const { patch } = useHistory()
  const trial = isTrialMode()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const confirmGenRef = useRef(0)

  const avatar = node?.self.avatar ?? ""

  function triggerSelect(): void {
    if (trial)
      fileRef.current?.click()
    else
      setPickerOpen(true)
  }

  function handlePick(url: string): void {
    patch.update(id, "avatar", url)
  }

  function handleClear(): void {
    patch.update(id, "avatar", "")
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file)
      return
    if (!AVATAR_CONTENT_TYPES.includes(file.type)) {
      t.error("图片格式不支持 (仅 png / jpeg / webp)")
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      t.error("图片超过 1MB")
      return
    }
    setEditorFile(file)
  }

  function handleEditorConfirm(processed: File): void {
    const gen = ++confirmGenRef.current
    const reader = new FileReader()
    reader.onload = () => {
      if (gen !== confirmGenRef.current)
        return
      if (typeof reader.result === "string")
        patch.update(id, "avatar", reader.result)
    }
    reader.onerror = () => {
      if (gen !== confirmGenRef.current)
        return
      t.error("读取图片失败")
    }
    reader.readAsDataURL(processed)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={triggerSelect}
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
            onClick={triggerSelect}
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

      {trial && (
        <input
          ref={fileRef}
          type="file"
          accept={AVATAR_CONTENT_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {!trial && (
        <AvatarPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          currentAvatar={avatar}
          onPick={handlePick}
        />
      )}

      {trial && (
        <ImageEditor
          open={editorFile !== null}
          onOpenChange={(o) => {
            if (!o)
              setEditorFile(null)
          }}
          file={editorFile}
          onConfirm={handleEditorConfirm}
        />
      )}
    </div>
  )
}
