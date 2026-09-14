import type { Resume } from "@shared/model"
import type { ChangeEvent } from "react"
import { resumeSchema } from "@shared/schema/resume"
import { useState } from "react"
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
import { useResumeCreate } from "@/hooks/query/resume"

export default function ImportDialog({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const create = useResumeCreate()
  const [data, setData] = useState<Resume | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setData(null)
    setError(null)
    if (!file) {
      return
    }

    let json: unknown
    try {
      json = JSON.parse(await file.text())
    }
    catch {
      setError("文件不是合法的 JSON")
      return
    }

    const result = resumeSchema.safeParse(json)
    if (!result.success) {
      setError("简历结构不符合要求")
      return
    }

    setData(result.data)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setData(null)
      setError(null)
    }
    onOpenChange(next)
  }

  function confirm() {
    if (!data) {
      return
    }
    create.mutate(data, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导入简历</DialogTitle>
          <DialogDescription>选择一个 resumic 导出的 JSON 文件</DialogDescription>
        </DialogHeader>

        <Input
          type="file"
          accept="application/json,.json"
          onChange={e => void handleFile(e)}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            取消
          </Button>
          <Button
            disabled={!data || create.isPending}
            onClick={confirm}
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
