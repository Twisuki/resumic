import type { ListResumesItem, Resume } from "@shared/model"
import { IconCheck, IconCopy, IconDownload, IconLoader2, IconPencil, IconTrash, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/api"
import DeleteDialog from "@/app/(main)/sections/right/files/delete-dialog"
import IconAction from "@/app/(main)/sections/right/files/icon-action"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useResumeDuplicate, useResumeRename } from "@/hooks/query/resume"
import { useResumeSnapshot } from "@/hooks/resume-snapshot"
import { downloadResumeJson, sanitizeFilename, withCopySuffix } from "@/lib/resume-export"
import { cn } from "@/lib/utils"

export default function Item({
  item,
  active,
  loading,
  onOpen,
}: Readonly<{
  item: ListResumesItem
  active: boolean
  loading: boolean
  onOpen: (id: number) => void
}>) {
  const rename = useResumeRename()
  const duplicate = useResumeDuplicate()
  const { saveAndSnapshot } = useResumeSnapshot()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.title)
  const [exporting, setExporting] = useState(false)
  const [copying, setCopying] = useState(false)

  function confirmEdit() {
    const title = draft.trim()
    setEditing(false)
    if (!title || title === item.title) {
      return
    }
    rename.mutate({ id: item.id, title })
  }

  function startEdit() {
    setDraft(item.title)
    setEditing(true)
  }

  /**
   * @description 导出当前行指向的简历: 当前打开的简历先保存再取快照, 否则直接从后端拉
   */
  async function handleExport() {
    if (exporting || copying)
      return
    setExporting(true)
    try {
      let snapshot: Resume
      if (active) {
        const saved = await saveAndSnapshot()
        if (!saved) {
          toast.error("没有可导出的简历")
          return
        }
        snapshot = saved
      }
      else {
        snapshot = await api.resume.get(item.id)
      }
      downloadResumeJson(snapshot, `${sanitizeFilename(item.title)}.json`)
      toast.success("已导出")
    }
    catch (error) {
      toast.error(`导出失败: ${(error as Error).message}`)
    }
    finally {
      setExporting(false)
    }
  }

  /**
   * @description 复制当前行指向的简历: 当前打开的先保存再复制, 否则直接从后端拉后复制
   */
  async function handleCopy() {
    if (exporting || copying)
      return
    setCopying(true)
    try {
      let snapshot: Resume
      if (active) {
        const saved = await saveAndSnapshot()
        if (!saved) {
          toast.error("没有可复制的简历")
          return
        }
        snapshot = saved
      }
      else {
        snapshot = await api.resume.get(item.id)
      }
      await duplicate.mutateAsync({
        ...snapshot,
        title: withCopySuffix(snapshot.title),
      })
      toast.success("已复制")
    }
    catch (error) {
      toast.error(`复制失败: ${(error as Error).message}`)
    }
    finally {
      setCopying(false)
    }
  }

  return (
    <div
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "outline" }),
        "justify-start gap-1 pr-1",
      )}
    >
      {editing
        ? (
            <Input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing)
                  return
                if (e.key === "Enter") {
                  confirmEdit()
                }
                else if (e.key === "Escape") {
                  setEditing(false)
                }
              }}
              className="h-6 min-w-0 flex-1 px-1.5 text-sm"
            />
          )
        : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onOpen(item.id)}
                  className="min-w-0 flex-1 truncate text-left outline-none disabled:pointer-events-none"
                >
                  {item.title}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={6}>
                {item.title}
              </TooltipContent>
            </Tooltip>
          )}

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        {loading && <IconLoader2 className="size-3.5 animate-spin text-muted-foreground" />}

        {!loading && editing && (
          <>
            <IconAction aria-label="确认" onClick={confirmEdit}><IconCheck /></IconAction>
            <IconAction aria-label="取消" onClick={() => setEditing(false)}><IconX /></IconAction>
          </>
        )}

        {!loading && !editing && (
          <div className="flex items-center gap-0.5">
            <IconAction
              aria-label="导出"
              title="导出"
              disabled={exporting || copying}
              onClick={() => void handleExport()}
            >
              {exporting
                ? <IconLoader2 className="animate-spin" />
                : <IconDownload />}
            </IconAction>

            <IconAction
              aria-label="复制"
              title="复制"
              disabled={exporting || copying}
              onClick={() => void handleCopy()}
            >
              {copying
                ? <IconLoader2 className="animate-spin" />
                : <IconCopy />}
            </IconAction>

            <DeleteDialog id={item.id} title={item.title}>
              <IconAction variant="destructive" aria-label="删除"><IconTrash /></IconAction>
            </DeleteDialog>

            <IconAction aria-label="编辑" title="重命名" onClick={startEdit}><IconPencil /></IconAction>
          </div>
        )}
      </div>
    </div>
  )
}
