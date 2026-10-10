"use client"

import type { AvatarSlotResponse } from "@shared/model"
import type { ChangeEvent, MouseEvent } from "react"
import { ErrorCode } from "@shared/error-code"
import { IconCheck, IconPencil, IconPlus, IconTrash, IconUpload, IconUser } from "@tabler/icons-react"
import Image from "next/image"
import { useRef, useState } from "react"
import ImageEditor from "@/components/image-editor"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAvatarCreate, useAvatarList, useAvatarRemove, useAvatarReplace } from "@/hooks/query/avatar"
import { ApiClientError } from "@/lib/request"
import { t } from "@/lib/toast"
import { cn } from "@/lib/utils"

/**
 * @description 客户端预校验, 与后端 service/avatar.ts 的硬限制对齐; 失败直接 toast 不发请求
 */
const MAX_BYTES = 1024 * 1024
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const

function checkFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type as typeof ACCEPTED_TYPES[number]))
    return "图片格式不支持 (仅 png / jpeg / webp)"
  if (file.size > MAX_BYTES)
    return "图片超过 1MB"
  return null
}

function describeError(code: number): string {
  if (code === ErrorCode.Avatar.TooLarge)
    return "图片超过 1MB"
  if (code === ErrorCode.Avatar.UnsupportedType)
    return "图片格式不支持"
  if (code === ErrorCode.Avatar.TooMany)
    return "槽位已达上限 (10)"
  if (code === ErrorCode.Avatar.NotFound)
    return "头像不存在"
  return "操作失败"
}

function describeApiError(e: unknown): string {
  if (e instanceof ApiClientError)
    return describeError(e.code)
  return e instanceof Error ? e.message : String(e)
}

/** @description 头像槽位 picker 弹窗: 槽位 grid + 上传 + 覆盖 / 删除 / 选用; 选用走 onPick, 不调 patch */
export default function AvatarPickerDialog({
  open,
  onOpenChange,
  currentAvatar,
  onPick,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAvatar: string
  onPick: (url: string) => void
}>) {
  const { data: slots, isLoading } = useAvatarList()
  const create = useAvatarCreate()
  const replace = useAvatarReplace()
  const remove = useAvatarRemove()

  const fileRef = useRef<HTMLInputElement>(null)
  const [editorFile, setEditorFile] = useState<File | null>(null)
  const [editorTargetId, setEditorTargetId] = useState<number | null>(null)

  const slotsSafe = slots ?? []
  const atCapacity = slotsSafe.length >= 10

  function handleUpload() {
    fileRef.current?.click()
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file)
      return
    const msg = checkFile(file)
    if (msg) {
      t.error(msg)
      return
    }
    setEditorFile(file)
    setEditorTargetId(null)
  }

  function handleReplaceClick(e: MouseEvent, id: number) {
    e.stopPropagation()
    setEditorTargetId(id)
    fileRef.current?.click()
  }

  async function handleEditorConfirm(processed: File) {
    const formData = new FormData()
    formData.append("file", processed)
    const isCreate = editorTargetId === null
    try {
      await t.promise(
        isCreate
          ? create.mutateAsync(formData)
          : replace.mutateAsync({ id: editorTargetId, formData }),
        {
          loading: "上传中...",
          success: isCreate ? "上传成功" : "覆盖成功",
          error: e => describeApiError(e),
        },
      ).catch(() => {})
    }
    finally {
      setEditorFile(null)
      setEditorTargetId(null)
    }
  }

  function handleRemove(e: MouseEvent, id: number) {
    e.stopPropagation()
    void t.promise(
      remove.mutateAsync(id),
      {
        loading: "删除中...",
        success: "已删除",
        error: e => describeApiError(e),
      },
    )
  }

  function handlePickSlot(url: string) {
    onPick(url)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>选择头像</DialogTitle>
          <DialogDescription>
            {"单文件 < 1MB, 支持 png / jpeg / webp, 最多 10 个槽位"}
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="grid grid-cols-3 gap-2">
          {isLoading && (
            <div className="col-span-3 py-6 text-center text-xs text-muted-foreground">
              加载中...
            </div>
          )}
          {!isLoading && slotsSafe.length === 0 && (
            <div className="col-span-3 py-6 text-center text-xs text-muted-foreground">
              还没有头像, 点击下方按钮上传
            </div>
          )}
          {slotsSafe.map(slot => (
            <SlotCard
              key={slot.id}
              slot={slot}
              isCurrent={slot.url === currentAvatar}
              onPick={handlePickSlot}
              onReplace={e => handleReplaceClick(e, slot.id)}
              onRemove={e => handleRemove(e, slot.id)}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2 border-dashed"
          onClick={handleUpload}
          disabled={atCapacity || create.isPending || replace.isPending}
        >
          {create.isPending || replace.isPending
            ? (
                <>
                  <IconUpload className="size-4 animate-pulse" />
                  上传中...
                </>
              )
            : (
                <>
                  <IconPlus className="size-4" />
                  {atCapacity ? "槽位已满" : "上传新头像"}
                </>
              )}
        </Button>

        <ImageEditor
          open={editorFile !== null}
          onOpenChange={(o) => {
            if (!o) {
              setEditorFile(null)
              setEditorTargetId(null)
            }
          }}
          file={editorFile}
          onConfirm={handleEditorConfirm}
        />
      </DialogContent>
    </Dialog>
  )
}

function SlotCard({
  slot,
  isCurrent,
  onPick,
  onReplace,
  onRemove,
}: Readonly<{
  slot: AvatarSlotResponse
  isCurrent: boolean
  onPick: (url: string) => void
  onReplace: (e: MouseEvent) => void
  onRemove: (e: MouseEvent) => void
}>) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPick(slot.url)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onPick(slot.url)
        }
      }}
      className={cn(
        "group relative flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-muted",
        "cursor-pointer transition-colors hover:border-foreground/30 focus-visible:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        isCurrent && "border-foreground/60 ring-1 ring-foreground/40",
      )}
    >
      <Image
        src={slot.url}
        alt={`头像槽位 ${slot.id}`}
        width={120}
        height={120}
        className="size-full object-cover"
      />

      {isCurrent && (
        <div className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-foreground text-background">
          <IconCheck className="size-3" />
        </div>
      )}

      <div className="absolute inset-x-1 bottom-1 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <button
          type="button"
          aria-label="选用"
          onClick={(e) => {
            e.stopPropagation()
            onPick(slot.url)
          }}
          className="flex size-7 items-center justify-center rounded bg-background/90 text-foreground shadow-sm hover:bg-background"
        >
          <IconUser className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="覆盖"
          onClick={onReplace}
          className="flex size-7 items-center justify-center rounded bg-background/90 text-foreground shadow-sm hover:bg-background"
        >
          <IconPencil className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="删除"
          onClick={onRemove}
          className="flex size-7 items-center justify-center rounded bg-background/90 text-destructive shadow-sm hover:bg-background"
        >
          <IconTrash className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
