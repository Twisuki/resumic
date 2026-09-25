export interface QuotaResponse {
  ai: { count: number, date: string, limit: number }
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
