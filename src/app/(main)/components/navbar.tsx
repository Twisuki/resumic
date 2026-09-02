"use client"

import {
  IconBrandGithub,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightExpandFilled,
  IconMenu2,
  IconUser,
  IconWorld,
  IconX,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// TODO: 接入 auth() 后, 替换为真实用户态. 当前固定未登录, 用于把 UI 形状先落地.
type NavbarUser = {
  name: string
  avatarUrl: string | null
} | null

const CURRENT_USER: NavbarUser = null

function AvatarPlaceholder({
  className,
}: Readonly<{
  className?: string
}>) {
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      <IconUser className="size-5" />
    </div>
  )
}

function Avatar({
  user,
  className,
}: Readonly<{
  user: NavbarUser
  className?: string
}>) {
  if (user?.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.name}
        width={32}
        height={32}
        className={cn("rounded-full object-cover", className)}
      />
    )
  }
  return <AvatarPlaceholder className={className} />
}

export default function Navbar({
  isAgentOpen,
  isSidebarOpen,
  onToggleAgent,
  onToggleSidebar,
}: Readonly<{
  isAgentOpen: boolean
  isSidebarOpen: boolean
  onToggleAgent: () => void
  onToggleSidebar: () => void
}>) {
  const user = CURRENT_USER

  return (
    <nav className="w-full h-13 lg:h-15 flex items-center border-b bg-background">
      <div className="w-full h-full mx-auto max-w-screen-2xl flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-primary text-base font-semibold sm:text-lg">
          Resumic
        </span>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="hidden md:inline-flex"
          >
            <Link
              href="https://github.com/Twisuki/resumic"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 仓库"
            >
              <IconBrandGithub />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            asChild
            className="hidden md:inline-flex"
          >
            <Link
              href="https://www.twis.uk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="个人主页"
            >
              <IconWorld />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onToggleAgent}
            aria-label="切换 Agent 面板"
            className="inline-flex md:hidden"
          >
            {isAgentOpen
              ? (
                  <IconLayoutSidebarRightExpandFilled />
                )
              : (
                  <IconLayoutSidebarLeftExpand />
                )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
            aria-label="切换 Sidebar 面板"
            className="inline-flex md:hidden"
          >
            {isSidebarOpen
              ? (
                  <IconX />
                )
              : (
                  <IconMenu2 />
                )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="账号菜单"
              className="flex size-8 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Avatar user={user} />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2 py-0.5">
                  <Avatar user={user} />
                  <span className="text-sm text-foreground">
                    {user?.name ?? "未登录"}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {user
                ? (
                    <DropdownMenuItem variant="destructive">
                      退出登录
                    </DropdownMenuItem>
                  )
                : (
                    <DropdownMenuItem>
                      登录
                    </DropdownMenuItem>
                  )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
