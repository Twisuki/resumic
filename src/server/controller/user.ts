import type { ApiResponse } from "@/server/model/api"
import type { ClearAiKeyResponse, QuotaResponse, SetAiKeyRequest, SetAiKeyResponse } from "@/server/model/dto/user"
import { err, ok } from "@/server/api"
import { auth as authenticate } from "@/server/auth"
import { service, ServiceError } from "@/server/service"
import { ErrorCode } from "@/shared/error-code"

export const user = {
  /**
   * @description 调 auth 拿 session, 委托 service.user.setAiKey 设 AI key + model
   */
  async setAiKey(data: SetAiKeyRequest): Promise<ApiResponse<SetAiKeyResponse>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    if (!data.key || !data.model) {
      return err(ErrorCode.Validation.InvalidParams, "key / model 不能为空")
    }
    try {
      return ok(await service.user.setAiKey(authed.session.userId, data.key, data.model))
    }
    catch (e) {
      if (e instanceof ServiceError) {
        return err(e.code, e.msg)
      }
      return err(ErrorCode.System.Internal, "服务异常")
    }
  },

  /**
   * @description 调 auth 拿 session, 委托 service.user.clearAiKey 清 AI key
   */
  async clearAiKey(): Promise<ApiResponse<ClearAiKeyResponse>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    try {
      return ok(await service.user.clearAiKey(authed.session.userId))
    }
    catch (e) {
      if (e instanceof ServiceError) {
        return err(e.code, e.msg)
      }
      return err(ErrorCode.System.Internal, "服务异常")
    }
  },

  /**
   * @description 调 auth 拿 session, 委托 service.user.getQuota 查 user 配额
   */
  async quota(): Promise<ApiResponse<QuotaResponse>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    try {
      return ok(await service.user.getQuota(authed.session.userId))
    }
    catch (e) {
      if (e instanceof ServiceError) {
        return err(e.code, e.msg)
      }
      return err(ErrorCode.System.Internal, "服务异常")
    }
  },
}
