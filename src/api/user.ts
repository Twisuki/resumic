import type { ClearAiKeyResponse, QuotaResponse, SetAiKeyRequest, SetAiKeyResponse } from "@shared/model"
import type { RequestOptions } from "@/lib/request"
import { request } from "@/lib/request"

export const user = {
  /**
   * @description 取 AI 与头像配额
   */
  quota: (options?: RequestOptions) => request<QuotaResponse>("/user/quota", { ...options, method: "GET" }),

  /**
   * @description 设置自配 AI key 与模型
   */
  setAiKey: (data: SetAiKeyRequest, options?: RequestOptions) =>
    request<SetAiKeyResponse>("/user/ai-key", { ...options, method: "PUT", body: data }),

  /**
   * @description 清除自配 AI key
   */
  clearAiKey: (options?: RequestOptions) => request<ClearAiKeyResponse>("/user/ai-key", { ...options, method: "DELETE" }),
}
