"use client"

import { useState } from "react"
import ApprovalDialog from "@/app/(main)/sections/left/agent/approval-dialog"
import Composer from "@/app/(main)/sections/left/agent/composer"
import Header from "@/app/(main)/sections/left/agent/header"
import List from "@/app/(main)/sections/left/agent/list"
import SettingsDialog from "@/app/(main)/sections/left/agent/settings-dialog"

/**
 * @description agent panel 三栏壳: header / list (flex-1, 唯一滚动) / composer; 顶层挂审批与设置弹窗
 */
export default function AgentPanel() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      <List />
      <Composer />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ApprovalDialog />
    </div>
  )
}
