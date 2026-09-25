"use client"

import type { ReactNode } from "react"
import type { IconName } from "@/config/icon"
import { useState } from "react"
import Icon from "@/components/icon"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ICON_GROUPS } from "@/config/icon"
import { cn } from "@/lib/utils"

/**
 * @description 图标选择器: 点击触发按钮弹出分组清单, 选中即回填并关闭
 */
export default function IconPicker({
  value,
  onSelect,
  children,
}: Readonly<{
  value: string
  onSelect: (name: IconName) => void
  children: ReactNode
}>) {
  const [open, setOpen] = useState(false)

  function handleSelect(name: IconName) {
    onSelect(name)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>选择图标</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex flex-col gap-4">
            {ICON_GROUPS.map(group => (
              <div key={group.type} className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {group.type}
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {group.icons.map(name => (
                    <button
                      key={name}
                      type="button"
                      aria-label={name}
                      title={name}
                      onClick={() => handleSelect(name)}
                      className={cn(
                        "flex w-20 shrink-0 flex-col items-center gap-1 rounded-md border border-transparent px-1 py-1.5 text-muted-foreground transition-colors",
                        "hover:border-sidebar-border hover:bg-muted hover:text-foreground",
                        name === value && "border-primary bg-primary/10 text-primary hover:text-primary",
                      )}
                    >
                      <Icon name={name} className="size-4 shrink-0" />
                      <span className="w-full truncate text-center text-[10px] leading-none">
                        {name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
