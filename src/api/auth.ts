import type { MeResponse } from "@shared/model"
import type { RequestOptions } from "@/lib/request"
import { request } from "@/lib/request"

export const auth = {
  /**
   * @description 取当前会话用户
   */
  me: (options?: RequestOptions) => request<MeResponse>("/auth", { ...options, method: "GET" }),
}
