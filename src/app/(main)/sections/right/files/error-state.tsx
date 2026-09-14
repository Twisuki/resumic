import type { ApiClientError } from "@/lib/request"
import { Button } from "@/components/ui/button"
import { redirectToGithubLogin } from "@/lib/auth-action"
import { isAuthError } from "@/lib/request"

export default function ErrorState({
  error,
}: Readonly<{
  error: ApiClientError
}>) {
  const auth = isAuthError(error)

  return (
    <div className="px-1 py-6 flex flex-col items-start gap-2 text-sm text-muted-foreground">
      <span>{auth ? "登录后查看简历" : "列表加载失败"}</span>
      {auth && (
        <Button
          size="sm"
          onClick={redirectToGithubLogin}
        >
          GitHub 登录
        </Button>
      )}
    </div>
  )
}
