import type { CreateResumeResponse, ListResumesResponse } from "@/server/model/dto/resume"
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
}
