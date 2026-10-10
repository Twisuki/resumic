import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useResumeDelete } from "@/hooks/query/resume"
import { t } from "@/lib/toast"

/** @description 受控的删除简历确认框 */
export default function DeleteDialog({
  id,
  title,
  open,
  onOpenChange,
}: Readonly<{
  id: number
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const remove = useResumeDelete()

  async function confirm() {
    try {
      await t.promise(
        remove.mutateAsync(id),
        {
          loading: "删除中...",
          success: "已删除",
          error: e => `删除失败: ${e instanceof Error ? e.message : String(e)}`,
        },
      )
      onOpenChange(false)
    }
    catch {
      // toast 已经展示, 弹窗保留让用户看到错误并重试
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除简历</DialogTitle>
          <DialogDescription>
            确定删除「
            {title}
            」吗？此操作不可撤销
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            variant="destructive"
            disabled={remove.isPending}
            onClick={confirm}
          >
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
