import type { UIMessage } from "ai"
import { useAiStore } from "@/stores/ai"

/**
 * @description selector: 订阅 messages (zustand 默认 selector, 每条流式 delta 会触发整 list 重渲; subscribeWithSelector 后续按需再加)
 */
export function useAiMessages(): UIMessage[] {
  return useAiStore(s => s.messages)
}
