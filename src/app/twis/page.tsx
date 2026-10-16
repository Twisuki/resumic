"use client"

import { useLayoutEffect } from "react"
import { useScale } from "@/app/(main)/hooks/scale"
import Navbar from "@/app/twis/components/navbar"
import { Resume } from "@/components/resume"
import { DEFAULT_RESUME } from "@/config/resume"
import { serialize } from "@/lib/tree"
import { useHistoryStore } from "@/stores/history"
import { useResumeStore } from "@/stores/resume"

const DEMO_RESUME_ID = 0

export default function Page() {
  const { scale, ref } = useScale<HTMLDivElement>()

  useLayoutEffect(() => {
    const trees = serialize(DEFAULT_RESUME)
    useResumeStore.setState({
      id: DEMO_RESUME_ID,
      profile: trees.profile,
      resume: trees.resume,
    })
    useHistoryStore.getState().reset()
    return () => {
      useResumeStore.setState({
        id: null,
        profile: null,
        resume: null,
      })
      useHistoryStore.getState().reset()
    }
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <main
        ref={ref}
        className="min-w-0 min-h-0 flex-1 w-full flex justify-center overflow-y-auto overflow-x-hidden no-scrollbar"
      >
        <Resume scale={scale} />
      </main>
    </div>
  )
}
