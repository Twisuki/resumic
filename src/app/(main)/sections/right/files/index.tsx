import Create from "@/app/(main)/sections/right/files/create"
import ErrorState from "@/app/(main)/sections/right/files/error-state"
import Item from "@/app/(main)/sections/right/files/item"
import ListSkeleton from "@/app/(main)/sections/right/files/skeleton"
import { useResumeList, useResumeOpen } from "@/hooks/query/resume"
import { useResume } from "@/hooks/resume"
import { t } from "@/lib/toast"

export default function Files() {
  const list = useResumeList()
  const open = useResumeOpen()
  const currentId = useResume().id

  function handleOpen(id: number) {
    open.mutate(id, {
      onError: (e) => {
        t.error(`打开失败: ${e instanceof Error ? e.message : String(e)}`)
      },
    })
  }

  return (
    <div className="w-full h-72 shrink-0 flex flex-col border-b border-sidebar-border">
      <header className="h-12 shrink-0 px-3 flex items-center text-sm font-semibold">
        简历列表
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-0.5 px-2 pb-2">
        {list.isPending && <ListSkeleton />}

        {list.isError && <ErrorState error={list.error} />}

        {list.data && (
          <>
            <Create />

            {list.data.map(item => (
              <Item
                key={item.id}
                item={item}
                active={item.id === currentId}
                loading={open.isPending && open.variables === item.id}
                onOpen={handleOpen}
              />
            ))}

            <p className="py-2 text-center text-xs text-muted-foreground">没有更多了</p>
          </>
        )}
      </div>
    </div>
  )
}
