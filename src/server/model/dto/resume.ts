import type { Resume } from "@/server/model/resume"

export interface ListResumesItem {
  id: number
  name: string
  updatedAt: string
}

export type ListResumesResponse = ListResumesItem[]

export type CreateResumeRequest = Resume

export type CreateResumeResponse = Resume

export type GetResumeResponse = Resume

export interface UpdateResumeRequest extends Resume {
  autosave?: boolean
}

export type UpdateResumeResponse = Resume

export interface PatchResumeRequest {
  name?: string
}

export interface PatchResumeResponse {
  name: string
}
