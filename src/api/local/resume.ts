import type {
  CreateResumeRequest,
  CreateResumeResponse,
  GetResumeResponse,
  ListResumesResponse,
  RenameResumeRequest,
  RenameResumeResponse,
  Resume,
  UpdateResumeRequest,
  UpdateResumeResponse,
} from "@shared/model"
import type { LocalState, StoredResume } from "@/api/local/model"
import type { RequestOptions } from "@/lib/request"
import { ErrorCode } from "@shared/error-code"
import { resumeSchema } from "@shared/schema/resume"
import { z } from "zod"
import { idSchema } from "@/api/local/model"
import { assertNotAborted, enqueueWrite, readState } from "@/api/local/storage"
import { ApiClientError } from "@/lib/request"

const renameSchema = z.object({ title: z.string() })

function assertId(id: number): void {
  if (!idSchema.safeParse(id).success) {
    throw new ApiClientError(ErrorCode.Validation.InvalidParams, "简历 ID 无效")
  }
}

function parseResume(data: Resume): Resume {
  const parsed = resumeSchema.safeParse(data)
  if (!parsed.success) {
    throw new ApiClientError(ErrorCode.Validation.InvalidParams, "简历数据无效")
  }
  return parsed.data
}

function findResume(state: LocalState, id: number): StoredResume {
  if (!state.resume || state.resume.id !== id) {
    throw new ApiClientError(ErrorCode.Resume.NotFound, "简历不存在")
  }
  return state.resume
}

export const resume = {
  /** @description 列出本地简历摘要 */
  async list(options?: RequestOptions): Promise<ListResumesResponse> {
    assertNotAborted(options)
    const { resume } = readState()
    assertNotAborted(options)
    return resume
      ? [{ id: resume.id, title: resume.data.title || resume.data.name || "未命名简历", updatedAt: resume.updatedAt }]
      : []
  },

  /** @description 按 ID 读取独立的简历快照 */
  async get(id: number, options?: RequestOptions): Promise<GetResumeResponse> {
    assertNotAborted(options)
    assertId(id)
    const resume = findResume(readState(), id)
    assertNotAborted(options)
    return structuredClone(resume.data)
  },

  /** @description 创建唯一一份本地简历, 已存在则报容量错误 */
  async create(data: CreateResumeRequest, options?: RequestOptions): Promise<CreateResumeResponse> {
    const parsed = parseResume(data)
    return enqueueWrite((state) => {
      if (state.resume) {
        throw new ApiClientError(ErrorCode.Local.ResumeLimitExceeded, "本地试用仅允许一份简历，请先删除现有简历")
      }
      if (state.nextResumeId === Number.MAX_SAFE_INTEGER) {
        throw new ApiClientError(ErrorCode.System.Internal, "本地简历 ID 序列已用尽")
      }
      const now = new Date().toISOString()
      const id = state.nextResumeId
      state.resume = { id, data: parsed, createdAt: now, updatedAt: now }
      state.nextResumeId = id + 1
      return { id, data: structuredClone(parsed) }
    }, options)
  },

  /** @description 全量保存简历, 请求字段不进入业务数据 */
  async update(id: number, data: UpdateResumeRequest, options?: RequestOptions): Promise<UpdateResumeResponse> {
    assertId(id)
    const parsed = parseResume(data)
    return enqueueWrite((state) => {
      const resume = findResume(state, id)
      resume.data = parsed
      resume.updatedAt = new Date().toISOString()
      return structuredClone(parsed)
    }, options)
  },

  /** @description 只更新简历标题, 保留最新内容 */
  async rename(id: number, data: RenameResumeRequest, options?: RequestOptions): Promise<RenameResumeResponse> {
    assertId(id)
    const parsed = renameSchema.safeParse(data)
    if (!parsed.success) {
      throw new ApiClientError(ErrorCode.Validation.InvalidParams, "简历名称无效")
    }
    const { title } = parsed.data
    return enqueueWrite((state) => {
      const resume = findResume(state, id)
      resume.data = { ...resume.data, title }
      resume.updatedAt = new Date().toISOString()
      return structuredClone(resume.data)
    }, options)
  },

  /** @description 删除简历, 保留 ID 序列与 AI 配置 */
  async remove(id: number, options?: RequestOptions): Promise<null> {
    assertId(id)
    return enqueueWrite((state) => {
      findResume(state, id)
      state.resume = null
      return null
    }, options)
  },
}
