export interface UploadAvatarResponse {
  url: string
  uploadedAt: string
}

export interface DeleteAvatarRequest {
  url: string
}

export interface AvatarQuotaResponse {
  bytes: number
  limit: number
}
