import type { AiConfigEntity, UserEntity } from "@server/model/entity"
import { db } from "@server/db"

export interface AiConfigCreateInput {
  id: string
  userId: number
  label: string
  apiStyle: string
  baseUrl: string
  model: string
  encryptedKey: string
}

export interface AiConfigUpdateInput {
  label?: string
  apiStyle?: string
  baseUrl?: string
  model?: string
  encryptedKey?: string
}

export const aiConfig = {
  /**
   * @description 按 userId 查配置, 按 createdAt desc 排序 (新的在前)
   */
  listByUserId(userId: number): Promise<AiConfigEntity[]> {
    return db.orm.public.AiConfig
      .where(c => c.userId.eq(userId))
      .orderBy(c => c.createdAt.desc())
      .all()
      .toArray()
  },

  /**
   * @description 按 id 查 AiConfig
   */
  findById(id: string): Promise<AiConfigEntity | null> {
    return db.orm.public.AiConfig.first({ id })
  },

  /**
   * @description 按 userId + label 查 (用于唯一性校验)
   */
  findByUserIdAndLabel(userId: number, label: string): Promise<AiConfigEntity | null> {
    return db.orm.public.AiConfig.first({ userId, label })
  },

  /**
   * @description 创建 AI 配置
   */
  create(input: AiConfigCreateInput): Promise<AiConfigEntity> {
    return db.orm.public.AiConfig.create(input)
  },

  /**
   * @description 按 id 部分更新 AI 配置
   */
  update(id: string, patch: AiConfigUpdateInput): Promise<AiConfigEntity | null> {
    return db.orm.public.AiConfig
      .where({ id })
      .update(patch)
  },

  /**
   * @description 按 id 删 AI 配置
   */
  delete(id: string): Promise<AiConfigEntity | null> {
    return db.orm.public.AiConfig
      .where({ id })
      .delete()
  },

  /**
   * @description 把 User.activeConfigId 指向指定配置
   */
  setActiveForUser(userId: number, configId: string): Promise<UserEntity | null> {
    return db.orm.public.User
      .where({ id: userId })
      .update({ activeConfigId: configId })
  },

  /**
   * @description 仅在 User.activeConfigId 等于给定 id 时清空 (删除 active 配置时用)
   */
  clearActiveIfMatches(userId: number, configId: string): Promise<UserEntity | null> {
    return db.orm.public.User
      .where({ id: userId, activeConfigId: configId })
      .update({ activeConfigId: null })
  },
}
