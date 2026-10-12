import type { AvatarSlotResponse, ListAvatarsResponse } from "@shared/model"
import type { RequestOptions } from "@/lib/request"
import { ErrorCode } from "@shared/error-code"
import { ApiClientError, request } from "@/lib/request"
import { runInMode } from "@/lib/trial-mode"

function remoteOnly<T>(operation: () => Promise<T>): Promise<T> {
  return runInMode(async (mode) => {
    if (mode === "trial")
      throw new ApiClientError(ErrorCode.Avatar.Forbidden, "本地试用不使用头像槽位")
    return operation()
  })
}

export const avatar = {
  /**
   * @description 列出当前用户的头像槽位
   */
  list: (options?: RequestOptions) => remoteOnly(() => request<ListAvatarsResponse>("/avatar", { ...options, method: "GET" })),

  /**
   * @description 上传新头像槽位, formData 需含 `file` 字段
   */
  create: (formData: FormData, options?: RequestOptions) =>
    remoteOnly(() => request<AvatarSlotResponse>("/avatar", { ...options, method: "POST", body: formData })),

  /**
   * @description 覆盖指定槽位文件, url 不变; formData 需含 `file` 字段
   */
  replace: (id: number, formData: FormData, options?: RequestOptions) =>
    remoteOnly(() => request<AvatarSlotResponse>(`/avatar/${id}`, { ...options, method: "PUT", body: formData })),

  /**
   * @description 删除指定槽位
   */
  remove: (id: number, options?: RequestOptions) =>
    remoteOnly(() => request<null>(`/avatar/${id}`, { ...options, method: "DELETE" })),
}
