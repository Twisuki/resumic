export interface GithubLoginRequest {
  next?: string
}

export interface GithubCallbackRequest {
  code: string
  state: string
}

export interface MeResponse {
  id: number
  github: string
  name: string
  avatarUrl: string | null
}

export interface AiQuotaResponse {
  count: number
  date: string
  limit: number
}

export interface SetAiKeyRequest {
  key: string
  model: string
}

export interface SetAiKeyResponse {
  hasKey: true
  model: string
}

export interface ClearAiKeyResponse {
  hasKey: false
}
