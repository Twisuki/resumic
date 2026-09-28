import type {
  ActivateAiConfigResponse,
  ApiResponse,
  CreateAiConfigRequest,
  CreateAiConfigResponse,
  ListAiConfigsResponse,
  UpdateAiConfigRequest,
  UpdateAiConfigResponse,
} from "@shared/model"
import { withSession } from "@server/controller/handle"
import { service } from "@server/service"

export const aiConfig = {
  /**
   * @description 调 auth 拿 session, 委托 service.aiConfig.list 取用户配置列表
   */
  async list(): Promise<ApiResponse<ListAiConfigsResponse>> {
    return withSession(session => service.aiConfig.list(session.userId))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.aiConfig.create 落库新配置
   */
  async create(data: CreateAiConfigRequest): Promise<ApiResponse<CreateAiConfigResponse>> {
    return withSession(session => service.aiConfig.create(session.userId, data))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.aiConfig.update 部分更新 (带 ownership 校验)
   */
  async update(id: string, data: UpdateAiConfigRequest): Promise<ApiResponse<UpdateAiConfigResponse>> {
    return withSession(session => service.aiConfig.update(session.userId, id, data))
  },

  /**
   * @description 调 auth 拿 session, 委托 service.aiConfig.remove 删除 (带 ownership 校验)
   */
  async remove(id: string): Promise<ApiResponse<null>> {
    return withSession(async (session) => {
      await service.aiConfig.remove(session.userId, id)
      return null
    })
  },

  /**
   * @description 调 auth 拿 session, 委托 service.aiConfig.activate 设为 active
   */
  async activate(id: string): Promise<ApiResponse<ActivateAiConfigResponse>> {
    return withSession(session => service.aiConfig.activate(session.userId, id))
  },
}
