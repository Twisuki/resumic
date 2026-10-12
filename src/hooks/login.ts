"use client"

import { useCallback, useEffect, useRef } from "react"
import { useLoadingContext } from "@/app/(main)/contexts/loading"
import { releaseSaveBoundary } from "@/hooks/history"
import { useTrialActions } from "@/hooks/trial"
import { redirectToGithubLogin } from "@/lib/auth-action"
import { t } from "@/lib/toast"
import { clearUpgradeIntent } from "@/lib/trial-upgrade"

/** @description 跳转失败后的兜底等待窗口, 从保存成功后的跳转开始计时 */
const LOGIN_TIMEOUT = 5000

interface UseLoginTrigger {
  pending: boolean
  trigger: () => void
}

/** @description 只有点击来源执行登录 effect, 本地严格保存成功后才跳转 */
export function useLoginTrigger(): UseLoginTrigger {
  const { loginPending, setLoginPending } = useLoadingContext()
  const { prepareLogin } = useTrialActions()
  const ownerRef = useRef(false)
  const preparationRef = useRef<Promise<string | null> | null>(null)
  const prepareRef = useRef(prepareLogin)
  prepareRef.current = prepareLogin

  useEffect(() => {
    if (!loginPending || !ownerRef.current)
      return
    let disposed = false
    let timer: number | undefined
    preparationRef.current ??= prepareRef.current()
    void preparationRef.current.then((next) => {
      if (disposed)
        return
      if (next === null) {
        ownerRef.current = false
        preparationRef.current = null
        setLoginPending(false)
        return
      }
      timer = window.setTimeout(() => {
        ownerRef.current = false
        preparationRef.current = null
        try {
          clearUpgradeIntent()
        }
        catch (error) {
          t.error(error instanceof Error ? error.message : String(error))
        }
        releaseSaveBoundary()
        setLoginPending(false)
        t.error("登录超时, 请重试")
      }, LOGIN_TIMEOUT)
      redirectToGithubLogin(next)
    }).catch((error: unknown) => {
      if (disposed)
        return
      ownerRef.current = false
      preparationRef.current = null
      releaseSaveBoundary()
      setLoginPending(false)
      t.error(error instanceof Error ? error.message : String(error))
    })
    return () => {
      disposed = true
      window.clearTimeout(timer)
    }
  }, [loginPending, setLoginPending])

  const trigger = useCallback(() => {
    if (loginPending || ownerRef.current)
      return
    ownerRef.current = true
    setLoginPending(true)
  }, [loginPending, setLoginPending])

  return { pending: loginPending, trigger }
}
