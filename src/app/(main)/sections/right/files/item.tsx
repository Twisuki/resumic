import type { ListResumesItem, Resume } from "@shared/model"
import { IconArrowBarRight, IconCopy, IconDotsVertical, IconLoader2, IconPencil, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/api"
import DeleteDialog from "@/app/(main)/sections/right/files/delete-dialog"
import IconAction from "@/app/(main)/sections/right/files/icon-action"
import RenameDialog from "@/app/(main)/sections/right/files/rename-dialog"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useResumeDuplicate } from "@/hooks/query/resume"
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
  const duplicate = useResumeDuplicate()
  const { saveAndSnapshot } = useResumeSnapshot()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [copying, setCopying] = useState(false)

  /**
   * @description 导出当前行指向的简历: 当前打开的先保存再取快照, 否则直接从后端拉
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
   * @description 备份当前行指向的简历: 当前打开的先保存再备份, 否则直接从后端拉后备份
   */
  async function handleBackup() {
    if (exporting || copying)
      return
    setCopying(true)
    try {
      let snapshot: Resume
      if (active) {
        const saved = await saveAndSnapshot()
        if (!saved) {
          toast.error("没有可备份的简历")
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
      toast.success("已备份")
    }
    catch (error) {
      toast.error(`备份失败: ${(error as Error).message}`)
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

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        {loading && <IconLoader2 className="size-3.5 animate-spin text-muted-foreground" />}

        {!loading && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <IconAction aria-label="更多操作" disabled={exporting || copying}>
                    {(exporting || copying)
                      ? <IconLoader2 className="animate-spin" />
                      : <IconDotsVertical />}
                  </IconAction>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>更多操作</TooltipContent>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
                  <IconPencil />
                  重命名
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleExport()} disabled={exporting || copying}>
                  <IconArrowBarRight />
                  {exporting ? "导出中..." : "导出"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleBackup()} disabled={exporting || copying}>
                  <IconCopy />
                  {copying ? "备份中..." : "备份"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDeleteOpen(true)}
                  disabled={exporting || copying}
                >
                  <IconTrash />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </Tooltip>
          </DropdownMenu>
        )}
      </div>

      <RenameDialog
        id={item.id}
        title={item.title}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
      <DeleteDialog
        id={item.id}
        title={item.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  )
}
