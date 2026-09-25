"use client"

import type { SaveFn } from "@/stores/history"
import { useEffect, useRef } from "react"
import { SidebarsProvider } from "@/app/(main)/contexts/sidebar"
import Left from "@/app/(main)/sections/left"
import Main from "@/app/(main)/sections/main"
import Navbar from "@/app/(main)/sections/navbar"
import Right from "@/app/(main)/sections/right"
import { useHistory } from "@/hooks/history"
import { useResumeUpdate } from "@/hooks/query/resume"
import { useResume } from "@/hooks/resume"
import { useShortcuts } from "@/hooks/shortcuts"

export default function Page() {
  useShortcuts()

  // 只注册保存传输: 何时保存 / 保存完怎么处理由 history hook 决定
  const update = useResumeUpdate()
  const { registerSave } = useHistory()
  const currentId = useResume().id

  // ref 保持最新值, 避免 registerSave 闭包过期 (currentId / mutation 切换简历时可能变)
  const ctxRef = useRef({ currentId, update })
  ctxRef.current = { currentId, update }

  useEffect(() => {
    const transport: SaveFn = async (snapshot, reason) => {
      const ctx = ctxRef.current
      if (!ctx.currentId)
        throw new Error("没有可保存的简历")
      await ctx.update.mutateAsync({
        id: ctx.currentId,
        data: { ...snapshot, autosave: reason === "auto" },
      })
    }
    registerSave(transport)
  }, [registerSave])

  return (
    <SidebarsProvider>
      <div className="w-screen h-screen flex flex-col">
        <Navbar />
        <div
          className="w-full flex-1 grid min-h-0 grid-rows-1 overflow-hidden grid-cols-1 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,794px)_minmax(16rem,1fr)]"
        >
          <Left />
          <Main />
          <Right />
        </div>
      </div>
    </SidebarsProvider>
  )
}
