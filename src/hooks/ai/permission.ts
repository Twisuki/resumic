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
   * @description 关闭弹窗, 同时 resolve(false) 给等待中的 execute
   */
  clearPending: () => void
}

/**
 * @description 权限 store 的 UI 切片, 给弹窗组件用; 不暴露 request 等内部方法
 */
export function useAiPermission(): UseAiPermission {
  const pending = useAiPermissionStore(s => s.pending)
  const setMode = useAiPermissionStore(s => s.setMode)
  const clearPending = useAiPermissionStore(s => s.clearPending)
  return {
    pending: pending ? { toolName: pending.toolName, args: pending.args } : null,
    setMode,
    clearPending,
  }
}
