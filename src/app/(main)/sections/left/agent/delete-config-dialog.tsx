import type { AiConfigDto } from "@shared/model"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteConfig } from "@/hooks/ai"
import { t } from "@/lib/toast"

/** @description 删除 AI 配置确认弹窗, 取消 / esc 不删, 确认才删 */
export default function DeleteConfigDialog({
  config,
  open,
  onOpenChange,
}: Readonly<{
  config: AiConfigDto | null
  open: boolean
  onOpenChange: (next: boolean) => void
}>) {
  const deleteConfig = useDeleteConfig()

  async function handleConfirm() {
    if (!config)
      return
    await t.promise(
      deleteConfig.mutateAsync(config.id),
      {
        loading: "删除中...",
        success: "已删除",
        error: e => `删除失败: ${e instanceof Error ? e.message : String(e)}`,
      },
    ).catch(() => {})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除 AI 配置</DialogTitle>
          <DialogDescription>
            确定删除「
            {config?.label ?? ""}
            」吗? 此操作不可撤销
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteConfig.isPending}
            onClick={handleConfirm}
          >
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
