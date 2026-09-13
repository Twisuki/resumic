import type { CreateResumeResponse, GetResumeResponse, ListResumesResponse, Resume, UpdateResumeResponse } from "@shared/model"
import { repo } from "@server/repo"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"

export const resume = {
  /**
   * @description 取用户简历摘要列表 (id + name + updatedAt)
   */
  async listByUserId(userId: number): Promise<ListResumesResponse> {
    const rows = await repo.resume.listByUserId(userId)
    return rows.map(r => ({
      id: r.id,
      name: (r.data as unknown as Resume).name,
      updatedAt: r.updatedAt,
    }))
  },

  /**
   * @description 创建简历并返完整 Resume
   */
  async create(userId: number, data: Resume): Promise<CreateResumeResponse> {
    const row = await repo.resume.create(userId, data)
    return row.data as unknown as Resume
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
