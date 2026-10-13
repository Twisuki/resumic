"use client"

import type { AvatarSlotResponse } from "@shared/model"
import { IconAlertTriangle, IconCheck, IconRefresh, IconUpload } from "@tabler/icons-react"
import Image from "next/image"
import { useTrialUpgrade } from "@/app/(main)/hooks/trial-upgrade"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AVATAR_MAX_SLOTS } from "@/config/avatar"
import { cn } from "@/lib/utils"

export default function TrialUpgradeDialog() {
  const { state, refreshSlots, uploadNewAvatar, replaceAvatar, retry, cancel } = useTrialUpgrade()
  const { open, phase, slots: avatars, source, uploadedAvatar, error } = state

  const busy = phase === "uploading-avatar" || phase === "creating-resume"
  const canDismiss = !busy

  function handleOpenChange(next: boolean) {
    if (!next && canDismiss)
      cancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>迁移本地简历</DialogTitle>
          <DialogDescription>{describeHint(phase)}</DialogDescription>
        </DialogHeader>

        {phase === "loading" && (
          <Body className="py-6 text-sm text-muted-foreground">正在读取本地简历…</Body>
        )}

        {phase === "source-conflict" && (
          <Body>
            <p className="text-sm">
              本地简历已被其他窗口修改或删除，迁移已停止。请重新打开本地简历后再登录。
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={cancel}>关闭</Button>
            </DialogFooter>
          </Body>
        )}

        {phase === "awaiting-avatar-choice" && source && (
          <AvatarChoiceBody
            avatars={avatars}
            source={source}
            uploadedAvatar={uploadedAvatar}
            onUploadNew={uploadNewAvatar}
            onReplace={replaceAvatar}
            onRefresh={refreshSlots}
          />
        )}

        {phase === "uploading-avatar" && (
          <Body className="py-6 text-sm text-muted-foreground">
            <IconUpload className="mr-2 inline size-4 animate-pulse" />
            正在上传头像到云端…
          </Body>
        )}

        {phase === "creating-resume" && (
          <Body className="py-6 text-sm text-muted-foreground">
            <IconUpload className="mr-2 inline size-4 animate-pulse" />
            正在创建云端简历…
          </Body>
        )}

        {phase === "completed" && (
          <Body>
            <p className="flex items-center gap-2 text-sm">
              <IconCheck className="size-4 text-primary" />
              迁移成功，新简历已打开
            </p>
            <DialogFooter className="mt-4">
              <Button onClick={cancel}>完成</Button>
            </DialogFooter>
          </Body>
        )}

        {(phase === "failed" || phase === "result-unknown") && (
          <Body>
            <ErrorBlock message={describeError(phase, error)} />
            {uploadedAvatar && (
              <p className="mt-2 text-xs text-muted-foreground">
                头像已上传到槽位 #
                {uploadedAvatar.id}
                ，重试时不会再上传
              </p>
            )}
            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" onClick={cancel}>取消迁移</Button>
              <Button onClick={() => void retry()}>
                <IconRefresh className="mr-1 size-4" />
                重试
              </Button>
            </DialogFooter>
          </Body>
        )}
      </DialogContent>
    </Dialog>
  )
}

function describeHint(phase: import("@/app/(main)/hooks/trial-upgrade").MigrationPhase): string {
  switch (phase) {
    case "loading":
      return "正在读取本地简历"
    case "awaiting-avatar-choice":
      return "选择头像槽位或上传新头像"
    case "uploading-avatar":
      return "正在上传头像"
    case "creating-resume":
      return "正在创建云端简历"
    case "completed":
      return "迁移完成"
    case "failed":
      return "迁移失败"
    case "result-unknown":
      return "网络结果未知"
    case "source-conflict":
      return "本地简历状态变更"
  }
}

function describeError(phase: import("@/app/(main)/hooks/trial-upgrade").MigrationPhase, error: Error | null): string {
  if (phase === "result-unknown")
    return "请求已中止或响应丢失，请核对云端简历与头像槽位状态后重试"
  if (!error)
    return "迁移失败"
  return `迁移失败: ${error.message}`
}

function Body({ children, className }: Readonly<{ children: React.ReactNode, className?: string }>) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>
}

function ErrorBlock({ message }: Readonly<{ message: string }>) {
  return (
    <p className="flex items-start gap-2 text-sm">
      <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <span>{message}</span>
    </p>
  )
}

interface AvatarChoiceBodyProps {
  avatars: AvatarSlotResponse[]
  source: import("@shared/model").Resume
  uploadedAvatar: { id: number, url: string } | null
  onUploadNew: () => void
  onReplace: (slotId: number) => void
  onRefresh: () => void
}

function AvatarChoiceBody({ avatars, source, onUploadNew, onReplace, onRefresh }: AvatarChoiceBodyProps) {
  const atCapacity = avatars.length >= AVATAR_MAX_SLOTS
  const avatarPreview = source.avatar
  const previewUrl = typeof avatarPreview === "string" ? avatarPreview : ""

  return (
    <Body>
      <div className="flex items-center gap-3">
        {previewUrl.startsWith("data:")
          ? (
              <Image
                src={previewUrl}
                alt="本地头像预览"
                width={56}
                height={64}
                className="size-14 rounded-md object-cover"
                unoptimized
              />
            )
          : (
              <div className="flex size-14 items-center justify-center rounded-md border border-dashed border-border bg-muted text-xs text-muted-foreground">
                无头像
              </div>
            )}
        <p className="flex-1 text-xs text-muted-foreground">
          本地头像是 data URL；覆盖现有槽位会改变其他引用该槽位的云端简历。
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {avatars.map(slot => (
          <button
            key={slot.id}
            type="button"
            aria-label={`覆盖槽位 ${slot.id}`}
            onClick={() => onReplace(slot.id)}
            className={cn(
              "group relative flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-muted",
              "cursor-pointer transition-colors hover:border-foreground/30 focus-visible:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
          >
            <Image
              src={slot.url}
              alt={`头像槽位 ${slot.id}`}
              width={120}
              height={120}
              className="size-full object-cover"
              unoptimized
            />
            <span className="absolute inset-x-1 bottom-1 rounded bg-background/90 px-1 text-[10px] text-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
              覆盖 #
              {slot.id}
            </span>
          </button>
        ))}
        {avatars.length === 0 && (
          <p className="col-span-3 py-4 text-center text-xs text-muted-foreground">
            还没有头像，点下方按钮上传
          </p>
        )}
      </div>

      <DialogFooter className="mt-2 gap-2">
        <Button
          variant="outline"
          className="w-full justify-center gap-2 border-dashed"
          onClick={onUploadNew}
          disabled={atCapacity}
        >
          <IconUpload className="size-4" />
          {atCapacity ? "槽位已满" : "上传新头像"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="刷新槽位"
          onClick={() => void onRefresh()}
        >
          <IconRefresh className="size-4" />
        </Button>
      </DialogFooter>
    </Body>
  )
}
