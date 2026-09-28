"use client"

import { useCallback, useEffect, useState } from "react"
import { redirectToGithubLogin } from "@/lib/auth-action"

/**
 * @description 跳转失败 (拦截, 服务器异常等) 后兜底回退的等待窗口
 */
const LOGIN_TIMEOUT = 5000

interface UseLoginTrigger {
  pending: boolean
  trigger: () => void
}

/**
 * @description 用户点击登录后, 把 pending 置 true, useEffect 真正触发跳转
 */
export function useLoginTrigger(): UseLoginTrigger {
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!pending)
      return
    const timer = window.setTimeout(setPending, LOGIN_TIMEOUT, false)
    redirectToGithubLogin()
    return () => window.clearTimeout(timer)
  }, [pending])

  const trigger = useCallback(() => {
    setPending(true)
  }, [])

  return { pending, trigger }
}
