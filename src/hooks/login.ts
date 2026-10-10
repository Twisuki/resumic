"use client"

import { useCallback, useEffect } from "react"
import { useLoadingContext } from "@/app/(main)/contexts/loading"
import { redirectToGithubLogin } from "@/lib/auth-action"
import { t } from "@/lib/toast"

/** @description 跳转失败 (拦截, 服务器异常等) 后兜底回退的等待窗口 */
const LOGIN_TIMEOUT = 5000

interface UseLoginTrigger {
  pending: boolean
  trigger: () => void
}

/** @description 用户点击登录后置 pending, useEffect 真正触发跳转; 超时回退并 toast */
export function useLoginTrigger(): UseLoginTrigger {
  const { loginPending, setLoginPending } = useLoadingContext()

  useEffect(() => {
    if (!loginPending)
      return
    const timer = window.setTimeout(() => {
      setLoginPending(false)
      t.error("登录超时, 请重试")
    }, LOGIN_TIMEOUT)
    redirectToGithubLogin()
    return () => window.clearTimeout(timer)
  }, [loginPending, setLoginPending])

  const trigger = useCallback(() => {
    setLoginPending(true)
  }, [setLoginPending])

  return { pending: loginPending, trigger }
}
