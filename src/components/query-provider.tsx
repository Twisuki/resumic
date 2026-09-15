"use client"

import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ApiClientError, isAuthError } from "@/lib/request"

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // 编辑器有未保存状态, 焦点回来重拉会打架
        refetchOnWindowFocus: false,
        // 业务错(鉴权失败 / 找不到简历等)直接展示, 不重试耗时长
        retry: (count, error) => !(error instanceof ApiClientError && isAuthError(error)) && count < 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * @description 服务端每次渲染新建, 浏览器侧复用同一个实例
 */
function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return createQueryClient()
  }
  browserQueryClient ??= createQueryClient()
  return browserQueryClient
}

/**
 * @description TanStack Query 的 provider, 在 root layout 挂一次
 */
export default function QueryProvider({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      {/* 包内部按 NODE_ENV 自判, 生产构建里是 no-op 且会被 tree-shake */}
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
