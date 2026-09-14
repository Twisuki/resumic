import Create from "@/app/(main)/sections/right/files/create"
import ErrorState from "@/app/(main)/sections/right/files/error-state"
import Item from "@/app/(main)/sections/right/files/item"
import ListSkeleton from "@/app/(main)/sections/right/files/skeleton"
import { useResumeList, useResumeOpen } from "@/hooks/query/resume"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 简历列表, 点击拉取该份简历, 高亮当前打开项
 */
export default function Files() {
  const list = useResumeList()
  const open = useResumeOpen()
  const currentId = useResumeStore(state => state.currentId)

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
                onOpen={open.mutate}
              />
            ))}

            <p className="py-2 text-center text-xs text-muted-foreground">没有更多了</p>
          </>
        )}
      </div>
    </div>
  )
}
