import type { AiConfigEntity } from "@server/model/entity"
import type { AiConfigUpdateInput } from "@server/repo/ai-config"
import type {
  ActivateAiConfigResponse,
  AiApiStyle,
  AiConfigDto,
  CreateAiConfigRequest,
  CreateAiConfigResponse,
  ListAiConfigsResponse,
  UpdateAiConfigRequest,
  UpdateAiConfigResponse,
} from "@shared/model"
import { encryptKey } from "@server/auth/crypto"
import { repo } from "@server/repo"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"
import { genId } from "@/lib/id"

const API_STYLES: readonly string[] = ["openai", "anthropic"]

/**
 * @description 校验 apiStyle 在允许集合内, 返窄化后的字面量
 */
function assertApiStyle(value: string): AiApiStyle {
  if (!API_STYLES.includes(value)) {
    throw new ServiceError(ErrorCode.Validation.InvalidParams, "apiStyle 必须是 openai 或 anthropic")
  }
  return value as AiApiStyle
}

/**
 * @description baseUrl 必须是合法 URL
 */
function assertUrl(value: string): string {
  try {
    // eslint-disable-next-line no-new
    new URL(value)
  }
  catch {
    throw new ServiceError(ErrorCode.Validation.InvalidParams, "baseUrl 不是合法 URL")
  }
  return value
}

/**
 * @description 非空字符串校验
 */
function assertNonEmpty(value: string, name: string): string {
  if (!value) {
    throw new ServiceError(ErrorCode.Validation.InvalidParams, `${name} 不能为空`)
  }
  return value
}

/**
 * @description entity 转对外 DTO, 剔除 key, 附 isActive
 */
function toDto(entity: AiConfigEntity, activeConfigId: string | null): AiConfigDto {
  return {
    id: entity.id,
    label: entity.label,
    apiStyle: entity.apiStyle as AiApiStyle,
    baseUrl: entity.baseUrl,
    model: entity.model,
    isActive: activeConfigId === entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}

/**
 * @description 取配置并校验 userId 归属, 不匹配抛 Ai.ConfigNotFound
 */
async function findOwnedOrThrow(id: string, userId: number): Promise<AiConfigEntity> {
  const entity = await repo.aiConfig.findById(id)
  if (!entity || entity.userId !== userId) {
    throw new ServiceError(ErrorCode.Ai.ConfigNotFound, "配置不存在")
  }
  return entity
}

export const aiConfig = {
  /**
   * @description 列表; isActive 由 User.activeConfigId 派生
   */
  async list(userId: number): Promise<ListAiConfigsResponse> {
    const [rows, user] = await Promise.all([
      repo.aiConfig.listByUserId(userId),
      repo.user.findById(userId),
    ])
    const activeConfigId = user?.activeConfigId ?? null
    return rows.map(row => toDto(row, activeConfigId))
  },

  /**
   * @description 新建配置; label 唯一, key 加密后落库; 用户当前无 active 时首条自动接管 active
   */
  async create(userId: number, input: CreateAiConfigRequest): Promise<CreateAiConfigResponse> {
    assertNonEmpty(input.label, "label")
    assertNonEmpty(input.model, "model")
    assertNonEmpty(input.key, "key")
    const apiStyle = assertApiStyle(input.apiStyle)
    const baseUrl = assertUrl(input.baseUrl)

    const user = await repo.user.findById(userId)
    if (!user) {
      throw new ServiceError(ErrorCode.System.Internal, "用户不存在")
    }

    const dup = await repo.aiConfig.findByUserIdAndLabel(userId, input.label)
    if (dup) {
      throw new ServiceError(ErrorCode.Ai.ConfigLabelConflict, "label 已存在")
    }

    const entity = await repo.aiConfig.create({
      id: genId(),
      userId,
      label: input.label,
      apiStyle,
      baseUrl,
      model: input.model,
      encryptedKey: encryptKey(input.key),
    })

    if (!user.activeConfigId) {
      await repo.aiConfig.setActiveForUser(userId, entity.id)
      return toDto(entity, entity.id)
    }
    return toDto(entity, user.activeConfigId)
  },

  /**
   * @description 部分更新; 未传字段不动, 传了 key 则重新加密覆盖
   */
  async update(userId: number, id: string, input: UpdateAiConfigRequest): Promise<UpdateAiConfigResponse> {
    const entity = await findOwnedOrThrow(id, userId)
    const patch: AiConfigUpdateInput = {}

    if (input.label !== undefined && input.label !== entity.label) {
      assertNonEmpty(input.label, "label")
      const dup = await repo.aiConfig.findByUserIdAndLabel(userId, input.label)
      if (dup && dup.id !== id) {
        throw new ServiceError(ErrorCode.Ai.ConfigLabelConflict, "label 已存在")
      }
      patch.label = input.label
    }
    if (input.apiStyle !== undefined) {
      patch.apiStyle = assertApiStyle(input.apiStyle)
    }
    if (input.baseUrl !== undefined) {
      patch.baseUrl = assertUrl(input.baseUrl)
    }
    if (input.model !== undefined) {
      patch.model = assertNonEmpty(input.model, "model")
    }
    if (input.key !== undefined) {
      patch.encryptedKey = encryptKey(assertNonEmpty(input.key, "key"))
    }

    const updated = Object.keys(patch).length > 0
      ? await repo.aiConfig.update(id, patch)
      : entity
    if (!updated) {
      throw new ServiceError(ErrorCode.Ai.ConfigNotFound, "配置不存在")
    }

    const user = await repo.user.findById(userId)
    return toDto(updated, user?.activeConfigId ?? null)
  },

  /**
   * @description 删除配置; 若为 active 先清空 User.activeConfigId (FK 约束要求)
   */
  async remove(userId: number, id: string): Promise<void> {
    await findOwnedOrThrow(id, userId)
    await repo.aiConfig.clearActiveIfMatches(userId, id)
    await repo.aiConfig.delete(id)
  },

  /**
   * @description 把指定配置设为 active
   */
  async activate(userId: number, id: string): Promise<ActivateAiConfigResponse> {
    const entity = await findOwnedOrThrow(id, userId)
    await repo.aiConfig.setActiveForUser(userId, id)
    return {
      activeConfigId: id,
      config: toDto(entity, id),
    }
  },
}
