"use client"

import { useScale } from "@/app/(main)/hooks/scale"
import AnonymousPlaceholder from "@/app/(main)/sections/main/anonymous-placeholder"
import EmptyPlaceholder from "@/app/(main)/sections/main/empty-placeholder"
import { Resume } from "@/components/resume"
import { useResume } from "@/hooks/resume"
import { useSession } from "@/hooks/session"

/** @description 主区域: 未登录显示介绍 + 登录引导, 已登录但未加载简历显示占位, 否则渲染 Resume */
export default function Main() {
  const { scale, ref } = useScale<HTMLDivElement>()
  const { id } = useResume()
  const { status } = useSession()

  if (status === "anonymous" || status === "error") {
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
