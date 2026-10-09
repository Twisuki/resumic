"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useRef } from "react"

/**
 * @description 打印开关:
 *   trigger: 业务侧调用, 把 id 传给已注册的 handler
 *   register: PrintFrame 在 mount 时把自己的导航函数注册进来, 返回注销函数
 *
 * context 不维护 id, 只持有"最新注册的 handler"引用; id 是 trigger 调用时的参数
 */
export interface PrintContextValue {
  trigger: (id: number) => void
  register: (handler: (id: number) => void) => () => void
}

export const PrintContext = createContext<PrintContextValue | null>(null)

export function PrintProvider({ children }: Readonly<{ children: ReactNode }>) {
  const handlerRef = useRef<((id: number) => void) | null>(null)

  const trigger = useCallback((id: number) => {
    handlerRef.current?.(id)
  }, [])

  const register = useCallback((handler: (id: number) => void) => {
    handlerRef.current = handler
    return () => {
      if (handlerRef.current === handler)
        handlerRef.current = null
    }
  }, [])

  return (
    <PrintContext value={{ trigger, register }}>
      {children}
    </PrintContext>
  )
}
