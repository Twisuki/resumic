import type {
  AvatarSlotResponse,
  CreateResumeRequest,
  CreateResumeResponse,
  ListAvatarsResponse,
} from "@shared/model"
import type { RequestOptions } from "@/lib/request"
import { request } from "@/lib/request"

/**
 * @description 试用升级专用的远端 transport, 不走 runInMode / facade 分流; 任何时候都直发后端
 */
export const remoteApi = {
  avatar: {
    list: (options?: RequestOptions) => request<ListAvatarsResponse>("/avatar", { ...options, method: "GET" }),
    create: (formData: FormData, options?: RequestOptions) =>
      request<AvatarSlotResponse>("/avatar", { ...options, method: "POST", body: formData }),
    replace: (id: number, formData: FormData, options?: RequestOptions) =>
      request<AvatarSlotResponse>(`/avatar/${id}`, { ...options, method: "PUT", body: formData }),
  },
  resume: {
    create: (data: CreateResumeRequest, options?: RequestOptions) =>
      request<CreateResumeResponse>("/resume", { ...options, method: "POST", body: data }),
  },
}
