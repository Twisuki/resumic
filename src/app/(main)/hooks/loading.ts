import { useLoadingContext } from "@/app/(main)/contexts/loading"
import { useResumeList } from "@/hooks/query/resume"
import { useSession } from "@/hooks/session"

export interface LoadingState {
  visible: boolean
  message: string | null
}

/** @description 聚合登录跳转 / session 恢复 / 简历列表首拉三个信号, 返回是否展示遮罩及当前文案 */
export function useLoading(): LoadingState {
  const { loginPending } = useLoadingContext()
  const session = useSession()
  const list = useResumeList()

  if (loginPending)
    return { visible: true, message: "正在登录..." }
  if (session.status === "pending")
    return { visible: true, message: "正在加载..." }
  if (session.status === "authenticated" && list.isPending)
    return { visible: true, message: "正在加载简历..." }

  return { visible: false, message: null }
}
