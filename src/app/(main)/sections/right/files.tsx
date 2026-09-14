import { IconLoader2, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useResumeList, useResumeOpen } from "@/hooks/query/resume"
import { redirectToGithubLogin } from "@/lib/auth-action"
import { isAuthError } from "@/lib/request"
import { useResumeStore } from "@/stores/resume"

const SKELETON_ROWS = 4

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
        {list.isPending && <FilesSkeleton />}

        {list.isError && (
          <div className="px-1 py-6 flex flex-col items-start gap-2 text-sm text-muted-foreground">
            <span>{isAuthError(list.error) ? "登录后查看简历" : "列表加载失败"}</span>
            {isAuthError(list.error) && (
              <Button
                size="sm"
                onClick={redirectToGithubLogin}
              >
                GitHub 登录
              </Button>
            )}
          </div>
        )}

        {list.data && (
          <>
            <Button variant="outline" className="justify-start">
              <IconPlus />
              <span className="min-w-0 truncate">新建简历</span>
            </Button>

            {list.data.map((item) => {
              const active = item.id === currentId
              const loading = open.isPending && open.variables === item.id

              return (
                <Button
                  key={item.id}
                  variant={active ? "secondary" : "outline"}
                  className="justify-start"
                  disabled={loading}
                  onClick={() => open.mutate(item.id)}
                >
                  <span className="min-w-0 truncate">{item.title}</span>
                  {loading && <IconLoader2 className="ml-auto animate-spin" />}
                </Button>
              )
            })}

            <p className="py-2 text-center text-xs text-muted-foreground">没有更多了</p>
          </>
        )}
      </div>
    </div>
  )
}

function FilesSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </>
  )
}
