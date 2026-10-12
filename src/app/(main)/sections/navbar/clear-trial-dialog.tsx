import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTrialActions } from "@/hooks/trial"

/** @description 明确确认后删除试用简历、未保存编辑及本地 AI 配置 */
export default function ClearTrialDialog({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const { clear } = useTrialActions()
  const [pending, setPending] = useState(false)

  async function confirm(): Promise<void> {
    if (pending)
      return
    setPending(true)
    try {
      await clear()
    }
    finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={value => !pending && onOpenChange(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>清空本地试用数据</DialogTitle>
          <DialogDescription>
            将删除此浏览器中的试用简历、未保存的编辑、AI 配置及已保存的 API key，并关闭本地试用。此操作不可撤销，请先导出需要保留的简历
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="destructive" disabled={pending} onClick={() => void confirm()}>
            {pending ? "清空中..." : "清空并关闭"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
