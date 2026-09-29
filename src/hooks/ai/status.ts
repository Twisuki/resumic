import type { AiStatus } from "@/stores/ai"
import { useAiStore } from "@/stores/ai"

export interface AiStatusSnapshot {
  status: AiStatus
  error: string | null
}

/**
 * @description selector: 订阅 status + error, 组件仅在这两项变化时重渲
 */
export function useAiStatus(): AiStatusSnapshot {
  return useAiStore(s => ({ status: s.status, error: s.error }))
}
