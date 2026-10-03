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
 * @description AI 工具权限 store: session-level grants 缓存 + pending 队列
 */
export interface AiPermissionStore {
  grants: Map<ToolName, Permission>
  pending: PendingRequest[]

  setMode: (name: ToolName, mode: Permission) => void
  request: (name: ToolName, args: unknown) => Promise<boolean>
  /**
   * @description 决议队首 + 出队; 队列非空时 dialog 保留, 自然切到下一个
   */
  resolvePending: (decision: boolean) => void
}

export const useAiPermissionStore = create<AiPermissionStore>()(set => ({
  grants: new Map(),
  pending: [],

  setMode: (name, mode) => set((state) => {
    const next = new Map(state.grants)
    next.set(name, mode)
    return { grants: next }
  }),

  request: (name, args) => new Promise<boolean>((resolve) => {
    set(state => ({ pending: [...state.pending, { toolName: name, args, resolve }] }))
  }),

  resolvePending: decision => set((state) => {
    const [first, ...rest] = state.pending
    if (first)
      first.resolve(decision)
    return { pending: rest }
  }),
}))
