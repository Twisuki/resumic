"use client"

import { Sidebar } from "@/app/(main)/components/sidebar"
import { useSidebars } from "@/app/(main)/hooks/sidebar"
import AgentPanel from "@/app/(main)/sections/left/agent"

export default function Left() {
  const { isLeftOpen, onLeftOpenChange } = useSidebars()
  return (
    <Sidebar
      side="left"
      openMobile={isLeftOpen}
      onOpenMobileChange={onLeftOpenChange}
    >
      <AgentPanel />
    </Sidebar>
  )
}
