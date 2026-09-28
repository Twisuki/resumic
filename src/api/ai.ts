import type {
  ActivateAiConfigResponse,
  CreateAiConfigRequest,
  CreateAiConfigResponse,
  ListAiConfigsResponse,
  UpdateAiConfigRequest,
  UpdateAiConfigResponse,
} from "@shared/model"
import type { RequestOptions } from "@/lib/request"
import { request } from "@/lib/request"

export const ai = {
  /**
   * @description 取当前账号的 AI 配置列表 (不含 key)
   */
  listConfigs: (options?: RequestOptions) => request<ListAiConfigsResponse>("/ai/config", { ...options, method: "GET" }),

  /**
   * @description 新建 AI 配置
   */
  createConfig: (data: CreateAiConfigRequest, options?: RequestOptions) =>
    request<CreateAiConfigResponse>("/ai/config", { ...options, method: "POST", body: data }),

  /**
   * @description 部分更新 AI 配置
   */
  updateConfig: (id: string, data: UpdateAiConfigRequest, options?: RequestOptions) =>
    request<UpdateAiConfigResponse>(`/ai/config/${id}`, { ...options, method: "PATCH", body: data }),

  /**
   * @description 删除 AI 配置
   */
  deleteConfig: (id: string, options?: RequestOptions) =>
    request<null>(`/ai/config/${id}`, { ...options, method: "DELETE" }),

  /**
   * @description 把指定配置设为 active
   */
  activateConfig: (id: string, options?: RequestOptions) =>
    request<ActivateAiConfigResponse>(`/ai/config/${id}`, { ...options, method: "POST" }),
}
