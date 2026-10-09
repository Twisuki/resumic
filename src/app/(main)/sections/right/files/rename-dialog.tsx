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

/**
 * @description 受控的重命名简历对话框, 由父组件传入 open/onOpenChange 控制显隐
 * 打开时自动把 draft 同步为最新 title, Enter 提交, Esc 取消
 */
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

  function confirm() {
    const next = draft.trim()
    if (!next || next === title) {
      onOpenChange(false)
      return
    }
    rename.mutate({ id, title: next }, { onSuccess: () => onOpenChange(false) })
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
