import type { ApiResponse } from "@/server/model/api"
import type { CreateResumeResponse, GetResumeResponse, ListResumesResponse, UpdateResumeResponse } from "@/server/model/dto/resume"
import type { Resume } from "@/server/model/resume"
import { err, ok } from "@/server/api"
import { auth as authenticate } from "@/server/auth"
import { service } from "@/server/service"
import { ErrorCode } from "@/shared/error-code"

export const resume = {
  /**
   * @description 调 auth 拿 session, 委托 service.resume.listByUserId 取用户简历摘要
   */
  async listResumes(): Promise<ApiResponse<ListResumesResponse>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    const items = await service.resume.listByUserId(authed.session.userId)
    return ok(items)
  },

  /**
   * @description 调 auth 拿 session, 委托 service.resume.create 落库简历
   */
  async createResume(data: Resume): Promise<ApiResponse<CreateResumeResponse>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    const resume = await service.resume.create(authed.session.userId, data)
    return ok(resume)
  },

  /**
   * @description 调 auth 拿 session, 委托 service.resume.getByIdForUser 取简历 (带 ownership 校验)
   */
  async getResume(id: number): Promise<ApiResponse<GetResumeResponse>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    const resume = await service.resume.getByIdForUser(id, authed.session.userId)
    if (!resume) {
      return err(ErrorCode.Resume.NotFound, "简历不存在")
    }
    return ok(resume)
  },

  /**
   * @description 调 auth 拿 session, 委托 service.resume.updateForUser 更新简历 (带 ownership 校验)
   */
  async updateResume(id: number, data: Resume): Promise<ApiResponse<UpdateResumeResponse>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    const resume = await service.resume.updateForUser(id, authed.session.userId, data)
    if (!resume) {
      return err(ErrorCode.Resume.NotFound, "简历不存在")
    }
    return ok(resume)
  },

  /**
   * @description 调 auth 拿 session, 委托 service.resume.deleteForUser 删除简历 (带 ownership 校验)
   */
  async deleteResume(id: number): Promise<ApiResponse<null>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    const deleted = await service.resume.deleteForUser(id, authed.session.userId)
    if (!deleted) {
      return err(ErrorCode.Resume.NotFound, "简历不存在")
    }
    return ok(null)
  },
}
