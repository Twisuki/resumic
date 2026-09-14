import type { ApiResponse, CreateResumeResponse, GetResumeResponse, ListResumesResponse, RenameResumeResponse, Resume, UpdateResumeResponse } from "@shared/model"
import { withSession } from "@server/controller/handle"
import { service } from "@server/service"

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
   * @description 调 auth 拿 session, 委托 service.resume.renameForUser 重命名简历 (带 ownership 校验)
   */
  async renameResume(id: number, title: string): Promise<ApiResponse<RenameResumeResponse>> {
    return withSession(session => service.resume.renameForUser(id, session.userId, title))
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
