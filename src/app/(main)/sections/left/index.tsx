"use client"

import { Sidebar } from "@/app/(main)/components/sidebar"
import { useSidebars } from "@/app/(main)/hooks/sidebar"

export default function Left() {
  const { isLeftOpen, onLeftOpenChange } = useSidebars()
  return (
    <Sidebar
      side="left"
      openMobile={isLeftOpen}
      onOpenMobileChange={onLeftOpenChange}
    >
      <div className="flex h-full flex-col">
        left
      </div>
    </Sidebar>
  )
}
