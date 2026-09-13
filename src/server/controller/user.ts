import type { ApiResponse, ClearAiKeyResponse, QuotaResponse, SetAiKeyRequest, SetAiKeyResponse } from "@shared/model"
import { withSession } from "@server/controller/handle"
import { service } from "@server/service"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"

export const user = {
  /**
   * @description 调 auth 拿 session, 委托 service.user.setAiKey 设 AI key + model
   */
  async setAiKey(data: SetAiKeyRequest): Promise<ApiResponse<SetAiKeyResponse>> {
    return withSession(async (session) => {
      if (!data.key || !data.model) {
        throw new ServiceError(ErrorCode.Validation.InvalidParams, "key / model 不能为空")
      }
      return service.user.setAiKey(session.userId, data.key, data.model)
    })
  },

  /**
   * @description 调 auth 拿 session, 委托 service.user.clearAiKey 清 AI key
   */
  async clearAiKey(): Promise<ApiResponse<ClearAiKeyResponse>> {
    return withSession(session => service.user.clearAiKey(session.userId))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.user.getQuota 查 user 配额
   */
  async quota(): Promise<ApiResponse<QuotaResponse>> {
    return withSession(session => service.user.getQuota(session.userId))
  },
}
