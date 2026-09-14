import type { ListResumesItem } from "@shared/model"
import { IconCheck, IconLoader2, IconPencil, IconTrash, IconX } from "@tabler/icons-react"
import { useState } from "react"
import DeleteDialog from "@/app/(main)/sections/right/files/delete-dialog"
import IconAction from "@/app/(main)/sections/right/files/icon-action"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useResumeRename } from "@/hooks/query/resume"
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
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.title)

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

  return (
    <div
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "outline" }),
        "group/item justify-start gap-1 pr-1",
      )}
    >
      {editing
        ? (
            <Input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={(e) => {
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
            <button
              type="button"
              disabled={loading}
              onClick={() => onOpen(item.id)}
              className="min-w-0 flex-1 truncate text-left outline-none disabled:pointer-events-none"
            >
              {item.title}
            </button>
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
          <div className="invisible flex items-center gap-0.5 group-hover/item:visible group-focus-within/item:visible">
            <IconAction aria-label="编辑" onClick={startEdit}><IconPencil /></IconAction>

            <DeleteDialog id={item.id} title={item.title}>
              <IconAction variant="destructive" aria-label="删除"><IconTrash /></IconAction>
            </DeleteDialog>
          </div>
        )}
      </div>
    </div>
  )
}
