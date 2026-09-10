import type { ApiResponse } from "@/server/model/api"
import type { CreateResumeResponse, GetResumeResponse, ListResumesResponse, UpdateResumeResponse } from "@/server/model/dto/resume"
import type { Resume } from "@/server/model/resume"
import { withSession } from "@/server/controller/handle"
import { service } from "@/server/service"

export const resume = {
  /**
   * @description 调 auth 拿 session, 委托 service.resume.listByUserId 取用户简历摘要
   */
  async listResumes(): Promise<ApiResponse<ListResumesResponse>> {
    return withSession(session => service.resume.listByUserId(session.userId))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.resume.create 落库简历
   */
  async createResume(data: Resume): Promise<ApiResponse<CreateResumeResponse>> {
    return withSession(session => service.resume.create(session.userId, data))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.resume.getByIdForUser 取简历 (带 ownership 校验)
   */
  async getResume(id: number): Promise<ApiResponse<GetResumeResponse>> {
    return withSession(session => service.resume.getByIdForUser(id, session.userId))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.resume.updateForUser 更新简历 (带 ownership 校验)
   */
  async updateResume(id: number, data: Resume): Promise<ApiResponse<UpdateResumeResponse>> {
    return withSession(session => service.resume.updateForUser(id, session.userId, data))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.resume.deleteForUser 删除简历 (带 ownership 校验)
   */
  async deleteResume(id: number): Promise<ApiResponse<null>> {
    return withSession(async (session) => {
      await service.resume.deleteForUser(id, session.userId)
      return null
    })
  },
}
