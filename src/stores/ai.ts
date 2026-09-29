import type { UIMessage } from "ai"
import { create } from "zustand"

/**
 * @description agent panel 状态机, 三态循环: idle 可发, streaming 流中, error 出错
 */
export type AiStatus = "idle" | "streaming" | "error"

/**
 * @description agent 面板运行时 store (messages 形状由 SDK 决定, 不在此层重新定义)
 */
export interface AiStore {
  messages: UIMessage[]
  status: AiStatus
  error: string | null

  setMessages: (messages: UIMessage[]) => void
  setStatus: (status: AiStatus) => void
  setError: (error: string | null) => void
}

export const useAiStore = create<AiStore>()(set => ({
  messages: [],
  status: "idle",
  error: null,

  setMessages: messages => set({ messages }),
  setStatus: status => set({ status }),
  setError: error => set({ error }),
}))
