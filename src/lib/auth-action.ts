import { t } from "@/lib/toast"

/** @description 跳 GitHub 授权页, 成功后回当前页 */
export function redirectToGithubLogin(): void {
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `/api/auth/github?next=${next}`
}

/** @description 清 cookie 后回首页 */
export async function logout(): Promise<void> {
  try {
    await t.promise(
      fetch("/api/auth/logout", { method: "POST" }),
      {
        loading: "退出中...",
        success: "已退出",
        error: e => `退出失败: ${e instanceof Error ? e.message : String(e)}`,
      },
    ).catch(() => {})
  }
  finally {
    window.location.href = "/"
  }
}
