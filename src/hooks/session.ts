import type { MeResponse } from "@shared/model"
import type { ApiClientError } from "@/lib/request"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/api"
import { keys } from "@/hooks/query/key"
import { isAuthError } from "@/lib/request"

export type SessionStatus = "pending" | "authenticated" | "anonymous" | "error"

export interface SessionState {
  user: MeResponse | null
  status: SessionStatus
  error: ApiClientError | null
  refresh: () => void
}

/**
 * @description 挂载时恢复登录态, 未登录归为 anonymous 而非错误
 */
export function useSession(): SessionState {
  const { data, error, isPending, refetch } = useQuery<MeResponse, ApiClientError>({
    queryKey: keys.auth.me,
    queryFn: ({ signal }) => api.auth.me({ signal }),
    // 登录态只在全页导航后变, 不需要重新过期
    staleTime: Infinity,
    retry: (count, error) => !isAuthError(error) && count < 1,
  })

  const status: SessionStatus = isPending
    ? "pending"
    : data
      ? "authenticated"
      : isAuthError(error)
        ? "anonymous"
        : "error"

  return {
    user: data ?? null,
    status,
    error: status === "error" ? error : null,
    refresh: refetch,
  }
}
