import type { AiConfigDto } from "@shared/model"
import type { LanguageModel } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"

/**
 * @description 按 active config + mode 选 SDK provider 实例; remote 与 trial 都走后端 /api/ai, trial 多塞 X-Resumic-Trial-* header 由服务端转发
 *
 * trial 不直连 LLM: 浏览器 CORS 限制让浏览器到 OpenAI / Anthropic 的直连大概率被拒;
 * 改成请求 /api/ai 时附 trial header, 服务端在 controller.ai.proxy 里 auth() 失败时按 header 透传 key 转发
 */
export function getModel(
  active: AiConfigDto | null,
  options: { mode: "trial" | "remote", key?: string | null },
): LanguageModel | null {
  if (!active)
    return null
  const trial = options.mode === "trial"
  if (trial && !options.key)
    return null
  const trialKey = options.key ?? null
  const headers = trial
    ? (): Record<string, string> => ({
        "X-Resumic-Trial": "1",
        "X-Resumic-Trial-Key": trialKey ?? "",
        "X-Resumic-Trial-ApiStyle": active.apiStyle,
        "X-Resumic-Trial-BaseUrl": active.baseUrl,
      })
    : undefined
  const apiKey = "placeholder"
  const baseURL = "/api/ai"
  if (active.apiStyle === "openai") {
    const openai = createOpenAI({
      baseURL,
      apiKey,
      headers: headers as unknown as Record<string, string>,
    })
    return openai(active.model)
  }
  if (active.apiStyle === "anthropic") {
    const anthropic = createAnthropic({
      baseURL,
      apiKey,
      headers: headers as unknown as Record<string, string>,
    })
    return anthropic(active.model)
  }
  return null
}
