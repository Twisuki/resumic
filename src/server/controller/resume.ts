import type { ApiResponse } from "@/server/model/api"
import type { CreateResumeResponse, ListResumesResponse } from "@/server/model/dto/resume"
import type { Resume } from "@/server/model/resume"
import { err, ok } from "@/server/api"
import { auth } from "@/server/auth"
import { service } from "@/server/service"

export const resume = {
  /**
   * @description 调 auth 拿 session, 委托 service.resume.listByUserId 取用户简历摘要
   */
  async listResumes(): Promise<ApiResponse<ListResumesResponse>> {
    const authed = await auth()
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
    const authed = await auth()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    const resume = await service.resume.create(authed.session.userId, data)
    return ok(resume)
  },
}
