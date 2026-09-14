import type { Resume } from "@shared/model/resume"

export interface ListResumesItem {
  id: number
  title: string
  updatedAt: string
}

export type ListResumesResponse = ListResumesItem[]

export type CreateResumeRequest = Resume

export interface CreateResumeResponse {
  id: number
  data: Resume
}

export type GetResumeResponse = Resume

export interface UpdateResumeRequest extends Resume {
  autosave?: boolean
}

export type UpdateResumeResponse = Resume

export interface RenameResumeRequest {
  title: string
}

export type RenameResumeResponse = Resume
