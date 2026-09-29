import type { AiConfigDto } from "@shared/model"
import type { LanguageModel } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"

/**
 * @description 按 active config 选 SDK provider 实例; baseURL 永远是 /api/ai, server 端会按 active.baseUrl 解密 key 后转发
 * @returns null 表示 "未配 / 不支持的 apiStyle", UI 进空状态, send 提前返回
 */
export function getModel(active: AiConfigDto | null): LanguageModel | null {
  if (!active)
    return null
  if (active.apiStyle === "openai") {
    const openai = createOpenAI({ baseURL: "/api/ai", apiKey: "placeholder" })
    return openai(active.model)
  }
  if (active.apiStyle === "anthropic") {
    const anthropic = createAnthropic({ baseURL: "/api/ai", apiKey: "placeholder" })
    return anthropic(active.model)
  }
  return null
}
