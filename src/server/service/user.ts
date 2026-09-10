import type { ClearAiKeyResponse, QuotaResponse, SetAiKeyResponse } from "@/server/model/dto/user"
import process from "node:process"
import { encryptKey } from "@/server/auth/crypto"
import { repo } from "@/server/repo"
import { ServiceError } from "@/server/service/error"
import { ErrorCode } from "@/shared/error-code"

const DEFAULT_AI_DAILY_LIMIT = 20
const DEFAULT_AVATAR_QUOTA_BYTES = 50 * 1024 * 1024

function aiLimit(): number {
  const v = process.env.AI_DAILY_LIMIT
  return v ? Number(v) : DEFAULT_AI_DAILY_LIMIT
}

function avatarLimit(): number {
  const v = process.env.AVATAR_QUOTA_BYTES
  return v ? Number(v) : DEFAULT_AVATAR_QUOTA_BYTES
}

function allowlist(): string[] {
  return (process.env.AI_MODEL_ALLOWLIST ?? "").split(",").map(s => s.trim()).filter(Boolean)
}

export const user = {
  /**
   * @description 设 AI key (加密后存) + model, 校验 model 在 allowlist
   */
  async setAiKey(userId: number, key: string, model: string): Promise<SetAiKeyResponse> {
    if (!allowlist().includes(model)) {
      throw new ServiceError(ErrorCode.AI.UpstreamError, "model 不在白名单")
    }
    const encrypted = encryptKey(key)
    const updated = await repo.user.setAiKey(userId, encrypted, model)
    if (!updated || !updated.aiModel) {
      throw new ServiceError(ErrorCode.System.Internal, "用户不存在或更新失败")
    }
    return { hasKey: true, model: updated.aiModel }
  },

  /**
   * @description 清 user 自配 AI key + model
   */
  async clearAiKey(userId: number): Promise<ClearAiKeyResponse> {
    const updated = await repo.user.clearAiKey(userId)
    if (!updated) {
      throw new ServiceError(ErrorCode.System.Internal, "用户不存在")
    }
    return { hasKey: false }
  },

  /**
   * @description 查 user AI + avatar 配额 (从 DB 读每日计数, 从 env 读限额)
   */
  async getQuota(userId: number): Promise<QuotaResponse> {
    const u = await repo.user.findById(userId)
    if (!u) {
      throw new ServiceError(ErrorCode.System.Internal, "用户不存在")
    }
    return {
      ai: {
        count: u.aiCount,
        date: u.aiDate ? u.aiDate.toISOString().slice(0, 10) : "",
        limit: aiLimit(),
      },
      avatar: {
        bytes: Number(u.avatarBytes),
        limit: avatarLimit(),
      },
    }
  },
}
