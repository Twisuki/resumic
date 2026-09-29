import type { AiStatus } from "@/stores/ai"
import { useShallow } from "zustand/react/shallow"
import { useAiStore } from "@/stores/ai"

export interface AiStatusSnapshot {
  status: AiStatus
  error: string | null
}

/**
 * @description selector: 订阅 status + error, 用 useShallow 保持引用稳定避免无限 re-render
 */
export function useAiStatus(): AiStatusSnapshot {
  return useAiStore(useShallow(s => ({ status: s.status, error: s.error })))
}
