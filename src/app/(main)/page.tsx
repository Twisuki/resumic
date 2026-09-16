"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { SidebarsProvider } from "@/app/(main)/contexts/sidebar"
import Left from "@/app/(main)/sections/left"
import Main from "@/app/(main)/sections/main"
import Navbar from "@/app/(main)/sections/navbar"
import Right from "@/app/(main)/sections/right"
import { useHistory } from "@/hooks/history"
import { useResumeUpdate } from "@/hooks/query/resume"
import { useResumeStore } from "@/stores/resume"

export default function Page() {
  // 自动保存: history store 提交阈值达 50 时调 saveFn 全量 PUT
  const update = useResumeUpdate()
  const { registerSave, finishSave } = useHistory()
  const currentId = useResumeStore(s => s.currentId)

  // ref 保持最新值, 避免 registerSave 闭包过期 (currentId / mutation 切换简历时可能变)
  const ctxRef = useRef({ currentId, update, finishSave })
  ctxRef.current = { currentId, update, finishSave }

  useEffect(() => {
    registerSave((snapshot) => {
      const ctx = ctxRef.current
      if (!ctx.currentId)
        return
      ctx.update.mutate(
        { id: ctx.currentId, data: { ...snapshot, autosave: true } },
        {
          onSettled: (_data, error) => {
            ctx.finishSave(!error)
            if (error)
              toast.error(`自动保存失败: ${error.message}`)
          },
        },
      )
    })
  }, [registerSave])

  return (
    <SidebarsProvider>
      <div className="w-screen h-screen flex flex-col">
        <Navbar />
        <div
          className="w-full flex-1 grid min-h-0"
          style={{ gridTemplateColumns: "minmax(16rem, 1fr) minmax(0, 794px) minmax(16rem, 1fr)" }}
        >
          <Left />
          <Main />
          <Right />
        </div>
      </div>
    </SidebarsProvider>
  )
}
