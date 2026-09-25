"use client"

import type { ReactNode } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export interface SidebarProps {
  side: "left" | "right"
  /** 移动端 (Sheet) 开关 */
  openMobile: boolean
  onOpenMobileChange: (open: boolean) => void
  className?: string
  children: ReactNode
}

/**
 * @description Resumic 通用 sidebar 容器.
 * - 移动端 (< md): shadcn Sheet 抽屉, side 决定从哪边滑入
 * - 桌面端 (>= md): 内联 <aside>, 进 flex 流, 永远常驻, 不响应 open 状态
 *
 * 由 sections/left 与 sections/right 共用.
 */
export function Sidebar({
  side,
  openMobile,
  onOpenMobileChange,
  className,
  children,
}: SidebarProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={onOpenMobileChange}>
        <SheetContent
          side={side}
          data-slot="sidebar"
          data-side={side}
          data-mobile="true"
          className={cn(
            "w-64 bg-sidebar p-0 text-sidebar-foreground",
            className,
          )}
        >
          <div className="flex h-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      data-slot="sidebar"
      data-side={side}
      className={cn(
        "hidden lg:flex min-w-0 min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground",
        side === "left"
          ? "lg:border-r border-sidebar-border"
          : "lg:border-l border-sidebar-border",
        className,
      )}
    >
      {children}
    </aside>
  )
}
