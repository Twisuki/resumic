"use client"

import type { SaveFn } from "@/stores/history"
import { useEffect } from "react"
import { api } from "@/api"
import LoadingOverlay from "@/app/(main)/components/loading-overlay"
import PrintFrame from "@/app/(main)/components/print-frame"
import { LoadingProvider } from "@/app/(main)/contexts/loading"
import { PrintProvider } from "@/app/(main)/contexts/print"
import { SidebarsProvider } from "@/app/(main)/contexts/sidebar"
import { useLoginError } from "@/app/(main)/hooks/login"
import Left from "@/app/(main)/sections/left"
import Main from "@/app/(main)/sections/main"
import Navbar from "@/app/(main)/sections/navbar"
import Right from "@/app/(main)/sections/right"
import { useHistory } from "@/hooks/history"
import { useShortcuts } from "@/hooks/shortcuts"
import { useTrialRestore } from "@/hooks/trial"

export default function Page() {
  useLoginError()
  useShortcuts()

  const { registerSave } = useHistory()
  const restored = useTrialRestore()

  useEffect(() => {
    const transport: SaveFn = async ({ id, data }, reason) => {
      await api.resume.update(id, { ...data, autosave: reason === "auto" })
    }
    registerSave(transport)
  }, [registerSave])

  if (!restored.ready) {
    return (
      <div role={restored.error ? "alert" : "status"} className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-sm">
        <p>{restored.error?.message ?? "正在打开本地简历..."}</p>
        {restored.error && (
          <button type="button" className="underline" onClick={() => window.location.reload()}>重新加载</button>
        )}
      </div>
    )
  }

  return (
    <LoadingProvider>
      <PrintProvider>
        <SidebarsProvider>
          <PrintFrame />
          <LoadingOverlay />
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
      </PrintProvider>
    </LoadingProvider>
  )
}
