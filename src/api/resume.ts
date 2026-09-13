import type {
  CreateResumeRequest,
  CreateResumeResponse,
  GetResumeResponse,
  ListResumesResponse,
  UpdateResumeRequest,
  UpdateResumeResponse,
} from "@shared/model"
import type { RequestOptions } from "@/lib/request"
import { request } from "@/lib/request"

export const resume = {
  /**
   * @description 取当前账号的简历摘要列表
   */
  list: (options?: RequestOptions) => request<ListResumesResponse>("/resume", { ...options, method: "GET" }),

  /**
   * @description 取单份简历
   */
  get: (id: number, options?: RequestOptions) => request<GetResumeResponse>(`/resume/${id}`, { ...options, method: "GET" }),

  /**
   * @description 新建简历
   */
  create: (data: CreateResumeRequest, options?: RequestOptions) =>
    request<CreateResumeResponse>("/resume", { ...options, method: "POST", body: data }),

  /**
   * @description 全量更新简历
   */
  update: (id: number, data: UpdateResumeRequest, options?: RequestOptions) =>
    request<UpdateResumeResponse>(`/resume/${id}`, { ...options, method: "PUT", body: data }),

  /**
   * @description 删除简历
   */
  remove: (id: number, options?: RequestOptions) => request<null>(`/resume/${id}`, { ...options, method: "DELETE" }),
}
