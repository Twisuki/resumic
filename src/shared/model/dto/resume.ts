import type { Resume } from "@shared/model/resume"

export interface ListResumesItem {
  id: number
  title: string
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
