import type { UIMessage } from "ai"
import { convertToModelMessages, readUIMessageStream, stepCountIs, streamText, toUIMessageStream } from "ai"
import { useCallback, useMemo, useRef } from "react"
import { MAX_STEPS, SYSTEM_PROMPT } from "@/config/ai"
import {
  useActivateConfig,
  useActiveConfig,
  useAiConfigs,
  useCreateConfig,
  useDeleteConfig,
  useUpdateConfig,
} from "@/hooks/ai/configs"
import { getModel } from "@/hooks/ai/providers"
import { tools } from "@/hooks/ai/tools"
import { genId } from "@/lib/id"
import { useAiStore } from "@/stores/ai"

export { useAiMessages } from "@/hooks/ai/messages"
export { useAiPermission } from "@/hooks/ai/permission"
export { useAiStatus } from "@/hooks/ai/status"

export {
  useActivateConfig,
  useActiveConfig,
  useAiConfigs,
  useCreateConfig,
  useDeleteConfig,
  useUpdateConfig,
}

export type { AiStatusSnapshot } from "@/hooks/ai/status"

export { getModel }

export type { AiStatus } from "@/stores/ai"

export interface UseAi {
  /**
   * @description 当前是否可发: 未配 active 模型 / 正在流中 / 上次出错 都不可发
   */
  ready: boolean
  /**
   * @description 主动中断当前流
   */
  stop: () => void
  /**
   * @description 发起一次对话; 无 active 配置或 input 为空时直接返回 noop
   */
  send: (input: string) => Promise<void>
  /**
   * @description 清空 messages + error + 回 idle, 不影响 abort controller
   */
  clear: () => void
}

/**
 * @description 顶层 hook: 把 active config / SDK streamText / store 三者串起来; 不持 ID 之外的任何业务状态, 状态全在 useAiStore
 */
export function useAi(): UseAi {
  const { data: configs } = useAiConfigs()
  const active = useMemo(() => configs?.find(c => c.isActive) ?? null, [configs])
  const model = useMemo(() => getModel(active), [active])
  const status = useAiStore(s => s.status)

  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const send = useCallback(async (input: string) => {
    const text = input.trim()
    if (!text || !model)
      return

    const userMsg: UIMessage = { id: genId(), role: "user", parts: [{ type: "text", text }] }
    const assistantMsg: UIMessage = { id: genId(), role: "assistant", parts: [] }
    const controller = new AbortController()
    abortRef.current = controller

    useAiStore.setState(prev => ({
      messages: [...prev.messages, userMsg, assistantMsg],
      status: "streaming",
      error: null,
    }))

    try {
      const result = streamText({
        model,
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages([...useAiStore.getState().messages.slice(0, -1)]),
        tools,
        stopWhen: stepCountIs(MAX_STEPS),
        abortSignal: controller.signal,
      })
      const uiStream = toUIMessageStream({ stream: result.stream })
      const assistantId = assistantMsg.id

      for await (const uiMessage of readUIMessageStream({ message: assistantMsg, stream: uiStream })) {
        useAiStore.setState(prev => ({
          messages: prev.messages.map(m => m.id === assistantId ? uiMessage : m),
        }))
      }
      useAiStore.setState({ status: "idle" })
    }
    catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        useAiStore.setState({ status: "idle" })
        return
      }
      useAiStore.setState({
        status: "error",
        error: e instanceof Error ? e.message : String(e),
      })
    }
    finally {
      abortRef.current = null
    }
  }, [model])

  const clear = useCallback(() => {
    useAiStore.setState({ messages: [], status: "idle", error: null })
  }, [])

  const ready = model !== null && status === "idle"

  return { ready, stop, send, clear }
}
