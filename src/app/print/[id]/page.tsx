"use client"

import type { PrintErrorKind } from "@/lib/print-protocol"
import { ErrorCode } from "@shared/error-code"
import { use, useEffect, useRef } from "react"
import { Resume } from "@/components/resume"
import { useResumeDetail } from "@/hooks/query/resume"
import { postPrintError } from "@/lib/print-protocol"
import { ApiClientError, isAuthError } from "@/lib/request"
import { useResumeStore } from "@/stores/resume"
import "./print.css"

function classifyError(error: unknown): { kind: PrintErrorKind, msg: string } {
  if (error instanceof ApiClientError) {
    if (isAuthError(error))
      return { kind: "auth", msg: error.message }
    if (error.code === ErrorCode.Resume.NotFound)
      return { kind: "not-found", msg: error.message }
    return { kind: "unknown", msg: error.message }
  }
  return { kind: "unknown", msg: error instanceof Error ? error.message : "打印失败" }
}

export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const resumeId = Number(id)
  const invalid = !Number.isInteger(resumeId) || resumeId <= 0

  const query = useResumeDetail(resumeId, { enabled: !invalid })
  const open = useResumeStore(s => s.open)
  const printedRef = useRef(false)

  /**
   * @description data 一旦到位就写入 iframe 的本地 store (独立 window, 不污染主页面)
   *
   * open() 会 reset history, 但 print 上下文不需要 history, 副作用无影响.
   */
  useEffect(() => {
    if (!query.data)
      return
    open(resumeId, query.data)
  }, [query.data, open, resumeId])

  /**
   * @description 失败时通知主窗口 toast (effect 依赖 isError, 重试期间不会重复发)
   */
  useEffect(() => {
    if (!query.isError || !query.error)
      return
    const { kind, msg } = classifyError(query.error)
    postPrintError(kind, msg, window.parent)
  }, [query.isError, query.error])

  /**
   * @description 渲染完成后等一帧 paint 再调 window.print(), 用 ref 保证只触发一次
   */
  useEffect(() => {
    if (!query.data || printedRef.current)
      return
    printedRef.current = true
    const rafId = requestAnimationFrame(() => {
      window.print()
    })
    return () => cancelAnimationFrame(rafId)
  }, [query.data])

  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground p-8">
        <span>简历不存在</span>
      </div>
    )
  }

  if (query.isError) {
    const { msg } = classifyError(query.error)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground p-8">
        <span>{msg}</span>
      </div>
    )
  }

  if (!query.data) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-8 print:bg-transparent print:py-0">
      <Resume scale={1} />
    </div>
  )
}
