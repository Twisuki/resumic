import type { AvatarSlotResponse, ListAvatarsResponse } from "@shared/model"
import type { RequestOptions } from "@/lib/request"
import { request } from "@/lib/request"

export const avatar = {
  /**
   * @description 列出当前用户的头像槽位
   */
  list: (options?: RequestOptions) => request<ListAvatarsResponse>("/avatar", { ...options, method: "GET" }),

  /**
   * @description 上传新头像槽位, formData 需含 `file` 字段
   */
  create: (formData: FormData, options?: RequestOptions) =>
    request<AvatarSlotResponse>("/avatar", { ...options, method: "POST", body: formData }),

  /**
   * @description 覆盖指定槽位文件, url 不变; formData 需含 `file` 字段
   */
  replace: (id: number, formData: FormData, options?: RequestOptions) =>
    request<AvatarSlotResponse>(`/avatar/${id}`, { ...options, method: "PUT", body: formData }),

  /**
   * @description 删除指定槽位
   */
  remove: (id: number, options?: RequestOptions) =>
    request<null>(`/avatar/${id}`, { ...options, method: "DELETE" }),
}
