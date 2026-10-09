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

/**
 * @description 受控的删除简历确认框, 由父组件传入 open/onOpenChange 控制显隐
 */
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

  function confirm() {
    remove.mutate(id, { onSuccess: () => onOpenChange(false) })
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
