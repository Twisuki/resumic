"use client"

import { useEffect } from "react"
import { t } from "@/lib/toast"

/**
 * @description 消费 /api/auth/github/callback 302 跳回时携带的 ?login=failed 参数,
 */
export function useLoginError(): void {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("login") !== "failed") {
      return
    }

    // 先取值再清 URL, 避免顺序错乱
    const msg = url.searchParams.get("msg") || "登录失败"

    url.searchParams.delete("login")
    url.searchParams.delete("reason")
    url.searchParams.delete("msg")
    window.history.replaceState(null, "", url.pathname + url.search + url.hash)

    t.error(msg)
  }, [])
}
