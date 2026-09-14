import type { CreateResumeResponse, GetResumeResponse, ListResumesResponse, RenameResumeResponse, Resume, UpdateResumeResponse } from "@shared/model"
import { repo } from "@server/repo"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"

/**
 * @description 简历条目名: title 为空则回退人名, 再空则回退占位文案
 */
function entryTitle(data: Resume): string {
  return data.title || data.name || "未命名简历"
}

export const resume = {
  /**
   * @description 取用户简历摘要列表 (id + title + updatedAt)
   */
  async listByUserId(userId: number): Promise<ListResumesResponse> {
    const rows = await repo.resume.listByUserId(userId)
    return rows.map(r => ({
      id: r.id,
      title: entryTitle(r.data as unknown as Resume),
      updatedAt: r.updatedAt,
    }))
  },

  /**
   * @description 创建简历并返完整 Resume
   */
  async create(userId: number, data: Resume): Promise<CreateResumeResponse> {
    const row = await repo.resume.create(userId, data)
    return { id: row.id, data: row.data as unknown as Resume }
  },

  /**
   * @description 查 Resume 实体并校验 userId 匹配, 不匹配抛 Resume.NotFound
   */
  async getByIdForUser(id: number, userId: number): Promise<GetResumeResponse> {
    const entity = await repo.resume.findById(id)
    if (!entity || entity.userId !== userId) {
      throw new ServiceError(ErrorCode.Resume.NotFound, "简历不存在")
    }
    return entity.data as unknown as Resume
  },

  /**
   * @description 校验 ownership 后更新 Resume 的 data 字段, 失败 (无实体 / 不匹配 / 行已删) 抛 Resume.NotFound
   */
  async updateForUser(id: number, userId: number, data: Resume): Promise<UpdateResumeResponse> {
    const entity = await repo.resume.findById(id)
    if (!entity || entity.userId !== userId) {
      throw new ServiceError(ErrorCode.Resume.NotFound, "简历不存在")
    }
    const updated = await repo.resume.update(id, data)
    if (!updated) {
      throw new ServiceError(ErrorCode.Resume.NotFound, "简历不存在")
    }
    return updated.data as unknown as Resume
  },

  /**
   * @description 校验 ownership 后只改 Resume 的 title (读全量 → 合并 → 整列写回), 失败抛 Resume.NotFound
   */
  async renameForUser(id: number, userId: number, title: string): Promise<RenameResumeResponse> {
    const entity = await repo.resume.findById(id)
    if (!entity || entity.userId !== userId) {
      throw new ServiceError(ErrorCode.Resume.NotFound, "简历不存在")
    }
    const data = entity.data as unknown as Resume
    const updated = await repo.resume.update(id, { ...data, title })
    if (!updated) {
      throw new ServiceError(ErrorCode.Resume.NotFound, "简历不存在")
    }
    return updated.data as unknown as Resume
  },

  /**
   * @description 校验 ownership 后删除 Resume, 失败抛 Resume.NotFound
   */
  async deleteForUser(id: number, userId: number): Promise<void> {
    const entity = await repo.resume.findById(id)
    if (!entity || entity.userId !== userId) {
      throw new ServiceError(ErrorCode.Resume.NotFound, "简历不存在")
    }
    const deleted = await repo.resume.delete(id)
    if (!deleted) {
      throw new ServiceError(ErrorCode.Resume.NotFound, "简历不存在")
    }
  },
}
