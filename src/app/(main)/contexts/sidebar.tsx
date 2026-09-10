"use client"

import type { Dispatch, ReactNode, SetStateAction } from "react"
import { createContext, use, useMemo, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

export type SidebarActive = "left" | "right" | null

export interface SidebarsContextValue {
  isMobile: boolean
  active: SidebarActive
  setActive: Dispatch<SetStateAction<SidebarActive>>
}

const SidebarsContext = createContext<SidebarsContextValue | null>(null)

export interface SidebarsProviderProps {
  children: ReactNode
}

export function SidebarsProvider({ children }: SidebarsProviderProps) {
  const isMobile = useIsMobile()

  const [active, setActive] = useState<SidebarActive>(null)

  const value = useMemo<SidebarsContextValue>(
    () => ({ isMobile, active, setActive }),
    [isMobile, active],
  )

  return (
    <SidebarsContext value={value}>
      {children}
    </SidebarsContext>
  )
}

export function useSidebarsContext(): SidebarsContextValue {
  const ctx = use(SidebarsContext)
  if (!ctx) {
    throw new Error("useSidebarsContext must be used within SidebarsProvider")
  }
  return ctx
}
