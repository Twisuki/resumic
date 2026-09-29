"use client"

import type { AiConfigDto } from "@shared/model"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import DeleteConfigDialog from "@/app/(main)/sections/left/agent/delete-config-dialog"
import SettingsRow from "@/app/(main)/sections/left/agent/settings-row"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAiConfigs } from "@/hooks/ai"

/**
 * @description 设置弹窗: AI config 列表 + 底部新增; 删除走 DeleteConfigDialog 二次确认
 */
export default function SettingsDialog({
  open,
  onOpenChange,
}: Readonly<{ open: boolean, onOpenChange: (next: boolean) => void }>) {
  const { data: configs = [], isPending } = useAiConfigs()
  const [showNewRow, setShowNewRow] = useState(false)
  const [deleting, setDeleting] = useState<AiConfigDto | null>(null)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>设置</DialogTitle>
            <DialogDescription>AI 配置: 可添加多条, 一条为 active</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {isPending && (
              <div className="py-4 text-center text-xs text-muted-foreground">加载中...</div>
            )}
            {!isPending && configs.length === 0 && !showNewRow && (
              <div className="py-4 text-center text-xs text-muted-foreground">
                还没有配置, 点下方新增
              </div>
            )}
            {configs.map(c => (
              <SettingsRow
                key={c.id}
                config={c}
                onRequestDelete={target => setDeleting(target)}
              />
            ))}
            {showNewRow && (
              <SettingsRow
                key="__new__"
                onSaved={() => setShowNewRow(false)}
              />
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2 border-dashed"
              onClick={() => setShowNewRow(true)}
              disabled={showNewRow}
            >
              <IconPlus className="size-4" />
              <span className="text-xs">新增</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteConfigDialog
        config={deleting}
        open={deleting !== null}
        onOpenChange={(next) => {
          if (!next)
            setDeleting(null)
        }}
      />
    </>
  )
}
