import Avatar from "@/app/(main)/sections/navbar/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/session"
import { logout, redirectToGithubLogin } from "@/lib/auth-action"

/**
 * @description 账号下拉菜单, 触发头是头像, 内容跟随登录态
 */
export default function UserMenu() {
  const { user, status, refresh } = useSession()

  // 首屏还没恢复完, 不能显示"未登录", 否则已登录用户会看到闪烁
  if (status === "pending") {
    return <Skeleton className="size-8 rounded-full" />
  }

  // GitHub 头像固定在 /<login>.png, 不需要后端存地址
  const avatarUrl = user ? `https://github.com/${user.github}.png` : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="账号菜单"
        className="flex size-8 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar name={user?.name} url={avatarUrl} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2 py-0.5">
            <Avatar name={user?.name} url={avatarUrl} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-foreground">
                {user?.name ?? (status === "anonymous" ? "未登录" : "加载失败")}
              </span>
              {user && (
                <span className="truncate text-xs text-muted-foreground">
                  @
                  {user.github}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {status === "authenticated" && (
          <DropdownMenuItem variant="destructive" onSelect={() => void logout()}>
            退出登录
          </DropdownMenuItem>
        )}

        {status === "anonymous" && (
          <DropdownMenuItem onSelect={redirectToGithubLogin}>
            登录
          </DropdownMenuItem>
        )}

        {status === "error" && (
          <DropdownMenuItem onSelect={refresh}>
            加载失败, 点击重试
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
