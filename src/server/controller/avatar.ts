import type { ApiResponse, AvatarSlotResponse, ListAvatarsResponse } from "@shared/model"
import { withSession } from "@server/controller/handle"
import { service } from "@server/service"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"

/**
 * @description 从表单取文件, 缺失时抛 InvalidParams
 */
function mustFile(form: FormData): File {
  const file = form.get("file")
  if (!(file instanceof File)) {
    throw new ServiceError(ErrorCode.Validation.InvalidParams, "缺少文件")
  }
  return file
}

export const avatar = {
  /**
   * @description 调 auth 拿 session, 委托 service.avatar.list 列槽位
   */
  async listAvatars(): Promise<ApiResponse<ListAvatarsResponse>> {
    return withSession(session => service.avatar.list(session.userId))
  },

  /**
   * @description 调 auth 拿 session, 校验文件后委托 service.avatar.create 上传新槽位
   */
  async uploadAvatar(form: FormData): Promise<ApiResponse<AvatarSlotResponse>> {
    return withSession(session => service.avatar.create(session.userId, mustFile(form)))
  },

  /**
   * @description 调 auth 拿 session, 校验文件后委托 service.avatar.replace 覆盖槽位文件
   */
  async replaceAvatar(id: number, form: FormData): Promise<ApiResponse<AvatarSlotResponse>> {
    return withSession(session => service.avatar.replace(session.userId, id, mustFile(form)))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.avatar.remove 删除槽位
   */
  async deleteAvatar(id: number): Promise<ApiResponse<null>> {
    return withSession(async (session) => {
      await service.avatar.remove(session.userId, id)
      return null
    })
  },
}
