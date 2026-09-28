/**
 * @description API 协议风格, 决定 client 端用哪个 AI SDK provider 实例
 */
export type AiApiStyle = "openai" | "anthropic"

/**
 * @description 对外暴露的 AI 配置视图, 永远不含 key
 */
export interface AiConfigDto {
  id: string
  label: string
  apiStyle: AiApiStyle
  baseUrl: string
  model: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ListAiConfigsResponse = AiConfigDto[]

export interface CreateAiConfigRequest {
  label: string
  apiStyle: AiApiStyle
  baseUrl: string
  model: string
  key: string
}

export type CreateAiConfigResponse = AiConfigDto

export interface UpdateAiConfigRequest {
  label?: string
  apiStyle?: AiApiStyle
  baseUrl?: string
  model?: string
  key?: string
}

export type UpdateAiConfigResponse = AiConfigDto

export interface ActivateAiConfigResponse {
  activeConfigId: string
  config: AiConfigDto
}
