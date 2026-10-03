"use client"

import type { ApiClientError } from "@/lib/request"
import { IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useLoginTrigger } from "@/hooks/login"
import { isAuthError } from "@/lib/request"

export default function ErrorState({
  error,
}: Readonly<{
  error: ApiClientError
}>) {
  const auth = isAuthError(error)
  const { pending: loginPending, trigger: triggerLogin } = useLoginTrigger()

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
      <span>{auth ? "登录后查看简历" : "列表加载失败"}</span>
      {auth && (
        <Button
          size="sm"
          disabled={loginPending}
          onClick={triggerLogin}
        >
          {loginPending
            ? (
                <>
                  <IconLoader2 className="animate-spin" />
                  登录中...
                </>
              )
            : "GitHub 登录"}
        </Button>
      )}
    </div>
  )
}
