/**
 * @description 跳 GitHub 授权页, 成功后回当前页
 */
export function redirectToGithubLogin(): void {
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `/api/auth/github?next=${next}`
}

/**
 * @description 清 cookie 后回首页
 *
 * 登出接口是 302 + 清 cookie, 不属于信封契约, 所以不走 request
 */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  }
  finally {
    window.location.href = "/"
  }
}
