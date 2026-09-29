"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAiPermission } from "@/hooks/ai"

/**
 * @description 权限弹窗: 写工具 ask 模式触发, 三选一 (拒绝 / 仅本次 / 始终允许); 关闭视为拒绝
 */
export default function ApprovalDialog() {
  const { pending, setMode, clearPending } = useAiPermission()
  const open = pending !== null

  function handleDeny() {
    clearPending()
  }

  function handleAllowOnce() {
    clearPending()
  }

  function handleAllowAlways() {
    if (pending)
      setMode(pending.toolName, "always")
    clearPending()
  }

  function handleOpenChange(next: boolean) {
    if (!next)
      handleDeny()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            允许工具
            {" "}
            {pending?.toolName}
            {" "}
            执行?
          </DialogTitle>
          <DialogDescription>
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-secondary px-2 py-1 text-xs font-mono whitespace-pre-wrap break-words">
              {pending ? JSON.stringify(pending.args, null, 2) : ""}
            </pre>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleDeny}>
            拒绝
          </Button>
          <Button type="button" variant="secondary" onClick={handleAllowOnce}>
            仅本次
          </Button>
          <Button type="button" onClick={handleAllowAlways}>
            始终允许
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
