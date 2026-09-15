import type { LanguageModel } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"
import { ENV } from "@/config/env"

/**
 * @description 解析 model 标识 (provider:model) 为 AI SDK 的 model 实例
 */
export function resolveModel(spec: string, apiKey: string): LanguageModel {
  const idx = spec.indexOf(":")
  if (idx < 0) {
    throw new ServiceError(ErrorCode.AI.UpstreamError, "model 格式应为 provider:model")
  }
  const provider = spec.slice(0, idx)
  const modelId = spec.slice(idx + 1)
  switch (provider) {
    case "openai":
      return createOpenAI({
        apiKey,
        baseURL: ENV.AI.OPENAI_BASE_URL || undefined,
      }).chat(modelId)
    default:
      throw new ServiceError(ErrorCode.AI.UpstreamError, `不支持的 provider: ${provider}`)
  }
}
