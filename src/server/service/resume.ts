import type { CreateResumeResponse, GetResumeResponse, ListResumesResponse, UpdateResumeResponse } from "@/server/model/dto/resume"
import type { Resume } from "@/server/model/resume"
import { repo } from "@/server/repo"

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
   * @description 查 Resume 实体并校验 userId 匹配, 不匹配返 null
   */
  async getByIdForUser(id: number, userId: number): Promise<GetResumeResponse | null> {
    const entity = await repo.resume.findById(id)
    if (!entity || entity.userId !== userId)
      return null
    return entity.data as unknown as Resume
  },

  /**
   * @description 校验 ownership 后更新 Resume 的 data 字段, 失败 (无实体 / 不匹配 / 行已删) 返 null
   */
  async updateForUser(id: number, userId: number, data: Resume): Promise<UpdateResumeResponse | null> {
    const entity = await repo.resume.findById(id)
    if (!entity || entity.userId !== userId)
      return null
    const updated = await repo.resume.update(id, data)
    if (!updated)
      return null
    return updated.data as unknown as Resume
  },

  /**
   * @description 校验 ownership 后删除 Resume, 返是否成功
   */
  async deleteForUser(id: number, userId: number): Promise<boolean> {
    const entity = await repo.resume.findById(id)
    if (!entity || entity.userId !== userId)
      return false
    const deleted = await repo.resume.delete(id)
    return deleted !== null
  },
}
