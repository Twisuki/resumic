import type { UIMessage } from "ai"
import process from "node:process"
import { SYSTEM_PROMPT } from "@server/ai/prompt"
import { resolveModel } from "@server/ai/provider"
import { decryptKey } from "@server/auth/crypto"
import { repo } from "@server/repo"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"
import { convertToModelMessages, streamText } from "ai"

const DEFAULT_DAILY_LIMIT = 20

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    throw new ServiceError(ErrorCode.AI.UpstreamError, `未配置 ${name}`)
  }
  return v
}

export const ai = {
  /**
   * @description 解析 key/model, 默认 key 先扣 quota, 调 streamText 返流
   */
  async chat(userId: number, messages: UIMessage[], abortSignal: AbortSignal) {
    const u = await repo.user.findById(userId)
    if (!u) {
      throw new ServiceError(ErrorCode.System.Internal, "用户不存在")
    }

    const own = u.aiKey && u.aiModel ? { key: u.aiKey, model: u.aiModel } : null
    const apiKey = own ? decryptKey(own.key) : requireEnv("AI_DEFAULT_KEY")
    const model = own ? own.model : requireEnv("AI_DEFAULT_MODEL")

    if (!own) {
      const limit = Number(process.env.AI_DAILY_LIMIT ?? DEFAULT_DAILY_LIMIT)
      const allowed = await repo.user.consumeAiQuota(userId, limit)
      if (!allowed) {
        throw new ServiceError(ErrorCode.AI.QuotaExhausted, "今日免费额度已用完")
      }
    }

    return streamText({
      model: resolveModel(model, apiKey),
      instructions: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      abortSignal,
    })
  },
}
