"use client"

import Agent from "@/app/(main)/components/agent"
import Main from "@/app/(main)/components/main"
import Navbar from "@/app/(main)/components/navbar"
import Sidebar from "@/app/(main)/components/sidebar"
import { useOverlay } from "@/app/(main)/hooks/overlay"

export default function Page() {
  const { isAgentOpen, isSidebarOpen, toggle, close } = useOverlay()

  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar
        isAgentOpen={isAgentOpen}
        isSidebarOpen={isSidebarOpen}
        onToggleAgent={() => toggle("agent")}
        onToggleSidebar={() => toggle("sidebar")}
      />
      <div className="w-full flex-1 flex mx-auto max-w-screen-2xl relative">
        <Agent
          isOpen={isAgentOpen}
          onClose={close}
        />
        <Main />
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={close}
        />
      </div>
    </div>
  )
}
