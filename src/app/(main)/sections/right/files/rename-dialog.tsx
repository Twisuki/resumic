import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useResumeRename } from "@/hooks/query/resume"
import { t } from "@/lib/toast"

/** @description 受控的重命名简历对话框, 打开时把 draft 同步为最新 title, Enter 提交, Esc 取消 */
export default function RenameDialog({
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
  const rename = useResumeRename()
  const [draft, setDraft] = useState(title)

  // 打开时同步最新 title, 重命名成功后外部传来的 prop 也会更新
  useEffect(() => {
    if (open)
      // eslint-disable-next-line react/set-state-in-effect -- 打开时同步 props, 受控表单重置
      setDraft(title)
  }, [open, title])

  async function confirm() {
    const next = draft.trim()
    if (!next || next === title) {
      onOpenChange(false)
      return
    }
    try {
      await t.promise(
        rename.mutateAsync({ id, title: next }),
        {
          loading: "重命名中...",
          success: "已重命名",
          error: e => `重命名失败: ${e instanceof Error ? e.message : String(e)}`,
        },
      )
      onOpenChange(false)
    }
    catch {
      // toast 已经展示, 弹窗保留
    }
  }

  const trimmed = draft.trim()
  const disabled = !trimmed || trimmed === title || rename.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重命名简历</DialogTitle>
          <DialogDescription>修改简历的标题</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            confirm()
          }}
        >
          <Input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing)
                return
              if (e.key === "Escape") {
                e.preventDefault()
                onOpenChange(false)
              }
            }}
          />
          <button type="submit" hidden disabled={disabled} />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button disabled={disabled} onClick={confirm}>
            {rename.isPending ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
