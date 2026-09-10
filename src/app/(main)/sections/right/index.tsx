"use client"

import { Sidebar } from "@/app/(main)/components/sidebar"
import { useSidebars } from "@/app/(main)/hooks/sidebar"
import Files from "@/app/(main)/sections/right/files"
import Options from "@/app/(main)/sections/right/options"

export default function Right() {
  const { isRightOpen, onRightOpenChange } = useSidebars()
  return (
    <Sidebar
      side="right"
      openMobile={isRightOpen}
      onOpenMobileChange={onRightOpenChange}
    >
      <Files />
      <Options />
    </Sidebar>
  )
}
