import type { Permission, ToolName } from "@shared/ai/tool"
import { useAiPermissionStore } from "@/stores/ai-permission"

export interface UseAiPermission {
  /**
   * @description 当前等待 UI 决议的权限请求, null 表示无
   */
  pending: { toolName: ToolName, args: unknown } | null
  /**
   * @description 把工具标记为 always / ask / deny, 写到 session 级 grants
   */
  setMode: (name: ToolName, mode: Permission) => void
  /**
   * @description 决议 pending: 传 true 放行, false 拒绝. 同时清空 pending 弹窗
   */
  resolvePending: (decision: boolean) => void
}

/**
 * @description 权限 store 的 UI 切片, 给弹窗组件用; 不暴露 request 等内部方法
 */
export function useAiPermission(): UseAiPermission {
  const queue = useAiPermissionStore(s => s.pending)
  const setMode = useAiPermissionStore(s => s.setMode)
  const resolvePending = useAiPermissionStore(s => s.resolvePending)
  const head = queue[0]
  return {
    pending: head ? { toolName: head.toolName, args: head.args } : null,
    setMode,
    resolvePending,
  }
}
