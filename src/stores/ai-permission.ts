import type { Permission, ToolName } from "@shared/ai/tool"
import { create } from "zustand"

/**
 * @description 等待 UI 决议的权限请求; resolve(true) = 放行, resolve(false) = 拒绝
 */
export interface PendingRequest {
  toolName: ToolName
  args: unknown
  resolve: (decision: boolean) => void
}

/**
 * @description AI 工具权限 store: session-level grants 缓存 + pending 弹窗队列 (任意时刻最多 1 条)
 */
export interface AiPermissionStore {
  grants: Map<ToolName, Permission>
  pending: PendingRequest | null

  setMode: (name: ToolName, mode: Permission) => void
  request: (name: ToolName, args: unknown) => Promise<boolean>
  clearPending: () => void
}

export const useAiPermissionStore = create<AiPermissionStore>()(set => ({
  grants: new Map(),
  pending: null,

  setMode: (name, mode) => set((state) => {
    const next = new Map(state.grants)
    next.set(name, mode)
    return { grants: next }
  }),

  request: (name, args) => new Promise<boolean>((resolve) => {
    set({ pending: { toolName: name, args, resolve } })
  }),

  clearPending: () => set((state) => {
    state.pending?.resolve(false)
    return { pending: null }
  }),
}))
