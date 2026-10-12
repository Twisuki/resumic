import type {
  ActivateAiConfigResponse,
  AiConfigDto,
  CreateAiConfigRequest,
  CreateAiConfigResponse,
  ListAiConfigsResponse,
  UpdateAiConfigRequest,
  UpdateAiConfigResponse,
} from "@shared/model"
import type { LocalState, StoredAiConfig } from "@/api/local/model"
import type { RequestOptions } from "@/lib/request"
import { ErrorCode } from "@shared/error-code"
import { z } from "zod"
import { credentials } from "@/api/local/credentials"
import { assertNotAborted, enqueueWrite, readState } from "@/api/local/storage"
import { genId } from "@/lib/id"
import { ApiClientError } from "@/lib/request"

const configSchema = z.object({
  label: z.string().min(1),
  apiStyle: z.enum(["openai", "anthropic"]),
  baseUrl: z.url(),
  model: z.string().min(1),
  key: z.string().min(1),
})
const updateSchema = configSchema.partial()

function findConfig(state: LocalState, id: string): StoredAiConfig {
  const config = state.aiConfigs.find(config => config.id === id)
  if (!config)
    throw new ApiClientError(ErrorCode.Ai.ConfigNotFound, "配置不存在")
  return config
}

function assertLabel(state: LocalState, label: string, id?: string): void {
  if (state.aiConfigs.some(config => config.label === label && config.id !== id))
    throw new ApiClientError(ErrorCode.Ai.ConfigLabelConflict, "label 已存在")
}

/** @description 派生 isActive 并剔除 key 与本地偏好 */
function toDto(config: StoredAiConfig, activeId: string | null): AiConfigDto {
  return {
    id: config.id,
    label: config.label,
    apiStyle: config.apiStyle,
    baseUrl: config.baseUrl,
    model: config.model,
    isActive: config.id === activeId,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  }
}

export const ai = {
  /** @description 按创建时间倒序列出配置, 不包含 key */
  async listConfigs(options?: RequestOptions): Promise<ListAiConfigsResponse> {
    assertNotAborted(options)
    const state = readState()
    const configs = state.aiConfigs.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    assertNotAborted(options)
    return configs.map(config => toDto(config, state.activeAiConfigId))
  },

  /** @description 新建配置, 默认 key 只存内存, 无 active 时自动激活 */
  async createConfig(data: CreateAiConfigRequest, options?: RequestOptions): Promise<CreateAiConfigResponse> {
    const parsed = configSchema.safeParse(data)
    if (!parsed.success)
      throw new ApiClientError(ErrorCode.Validation.InvalidParams, "AI 配置参数无效")
    const { key, ...fields } = parsed.data
    const id = genId()
    return enqueueWrite((state) => {
      assertLabel(state, fields.label)
      const now = new Date().toISOString()
      const config: StoredAiConfig = { ...fields, id, createdAt: now, updatedAt: now, persistKey: false }
      state.aiConfigs.unshift(config)
      state.activeAiConfigId ??= id
      return toDto(config, state.activeAiConfigId)
    }, options, () => credentials.set(id, key))
  },

  /** @description 部分更新配置, 未传 key 保持原值 */
  async updateConfig(id: string, data: UpdateAiConfigRequest, options?: RequestOptions): Promise<UpdateAiConfigResponse> {
    const parsed = updateSchema.safeParse(data)
    if (!parsed.success)
      throw new ApiClientError(ErrorCode.Validation.InvalidParams, "AI 配置参数无效")
    const { key, ...fields } = parsed.data
    return enqueueWrite((state) => {
      const config = findConfig(state, id)
      if (fields.label !== undefined && fields.label !== config.label)
        assertLabel(state, fields.label, id)
      let changed = key !== undefined
      for (const [name, value] of Object.entries(fields)) {
        if (value !== undefined && (name !== "label" || value !== config.label)) {
          Object.assign(config, { [name]: value })
          changed = true
        }
      }
      if (key !== undefined && config.persistKey)
        config.key = key
      if (changed)
        config.updatedAt = new Date().toISOString()
      return toDto(config, state.activeAiConfigId)
    }, options, () => {
      if (key !== undefined)
        credentials.set(id, key)
    })
  },

  /** @description 删除配置及 key, 删除 active 时只清空激活引用 */
  async deleteConfig(id: string, options?: RequestOptions): Promise<null> {
    return enqueueWrite((state) => {
      findConfig(state, id)
      state.aiConfigs = state.aiConfigs.filter(config => config.id !== id)
      if (state.activeAiConfigId === id)
        state.activeAiConfigId = null
      return null
    }, options, () => credentials.remove(id))
  },

  /** @description 激活指定配置, 同时只允许一个 active */
  async activateConfig(id: string, options?: RequestOptions): Promise<ActivateAiConfigResponse> {
    return enqueueWrite((state) => {
      const config = findConfig(state, id)
      state.activeAiConfigId = id
      return { activeConfigId: id, config: toDto(config, id) }
    }, options)
  },

  /** @description 读取当前窗口 key, 没有内存值时使用已允许持久化的 key */
  getKey(id: string): string | undefined {
    const config = findConfig(readState(), id)
    return credentials.get(id) ?? config.key
  },

  /** @description 读取配置的本地 key 持久化偏好 */
  getPersistKey(id: string): boolean {
    return findConfig(readState(), id).persistKey
  },

  /** @description 修改持久化偏好, 开启前由设置 UI 完成用户确认 */
  async setPersistKey(id: string, enabled: boolean): Promise<void> {
    if (typeof enabled !== "boolean")
      throw new ApiClientError(ErrorCode.Validation.InvalidParams, "持久化偏好无效")
    let key: string | undefined
    return enqueueWrite((state) => {
      const config = findConfig(state, id)
      key = credentials.get(id) ?? config.key
      if (enabled && !key)
        throw new ApiClientError(ErrorCode.Validation.InvalidParams, "请先填写 API key")
      config.persistKey = enabled
      if (enabled)
        config.key = key
      else
        delete config.key
      config.updatedAt = new Date().toISOString()
    }, undefined, () => {
      if (key !== undefined)
        credentials.set(id, key)
    })
  },

  /** @description 同步其他窗口的配置变化, 保留当前窗口的非持久化 key */
  syncCredentials(): void {
    credentials.sync(readState().aiConfigs)
  },
}
