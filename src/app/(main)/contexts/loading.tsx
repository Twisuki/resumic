"use client"

import type { Dispatch, ReactNode, SetStateAction } from "react"
import { createContext, use, useState } from "react"

export interface LoadingContextValue {
  loginPending: boolean
  setLoginPending: Dispatch<SetStateAction<boolean>>
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

export function LoadingProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [loginPending, setLoginPending] = useState(false)

  return (
    <LoadingContext value={{ loginPending, setLoginPending }}>
      {children}
    </LoadingContext>
  )
}

export function useLoadingContext(): LoadingContextValue {
  const ctx = use(LoadingContext)
  if (!ctx) {
    throw new Error("useLoadingContext must be used within LoadingProvider")
  }
  return ctx
}
