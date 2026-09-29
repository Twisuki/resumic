"use client"

import ApprovalDialog from "@/app/(main)/sections/left/agent/approval-dialog"
import Composer from "@/app/(main)/sections/left/agent/composer"
import Header from "@/app/(main)/sections/left/agent/header"
import List from "@/app/(main)/sections/left/agent/list"

/**
 * @description agent panel 三栏壳: header / list (flex-1, 唯一滚动) / composer; 设置弹窗挂在 composer 内
 */
export default function AgentPanel() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <List />
      <Composer />
      <ApprovalDialog />
    </div>
  )
}
