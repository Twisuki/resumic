"use client"

import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // 编辑器有未保存状态, 焦点回来重拉会打架
        refetchOnWindowFocus: false,
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
    </QueryClientProvider>
  )
}
