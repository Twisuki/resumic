"use client"

import { useScale } from "@/app/(main)/hooks/scale"
import AnonymousPlaceholder from "@/app/(main)/sections/main/anonymous-placeholder"
import EmptyPlaceholder from "@/app/(main)/sections/main/empty-placeholder"
import { Resume } from "@/components/resume"
import { useResume } from "@/hooks/resume"
import { useSession } from "@/hooks/session"

import { useTrialMode } from "@/lib/trial-mode"

/** @description 主区域允许已登录或本地试用编辑, 无简历时显示占位 */
export default function Main() {
  const { scale, ref } = useScale<HTMLDivElement>()
  const { id } = useResume()
  const { status } = useSession()
  const { enabled } = useTrialMode()

  if (!enabled && (status === "anonymous" || status === "error")) {
    return (
      <main
        ref={ref}
        className="min-w-0 min-h-0 w-full h-full flex items-center justify-center overflow-hidden"
      >
        <AnonymousPlaceholder />
      </main>
    )
  }

  if (id === null) {
    return (
      <main
        ref={ref}
        className="min-w-0 min-h-0 w-full h-full flex items-center justify-center overflow-hidden"
      >
        <EmptyPlaceholder />
      </main>
    )
  }

  return (
    <main
      ref={ref}
      className="min-w-0 min-h-0 w-full h-full flex justify-center overflow-y-auto overflow-x-hidden no-scrollbar"
    >
      <Resume scale={scale} />
    </main>
  )
}
