import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { t } from "@/lib/toast"

/** @description 清空对话确认弹窗, 破坏性操作走强制 dialog 确认 */
export default function ClearConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: Readonly<{
  open: boolean
  onOpenChange: (next: boolean) => void
  onConfirm: () => void
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>清空对话</DialogTitle>
          <DialogDescription>
            确定清空当前所有消息吗? 此操作不可撤销
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm()
              t.success("已清空对话")
              onOpenChange(false)
            }}
          >
            清空
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
