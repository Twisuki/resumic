import type {
  CreateResumeRequest,
  CreateResumeResponse,
  GetResumeResponse,
  ListResumesResponse,
  RenameResumeRequest,
  RenameResumeResponse,
  UpdateResumeRequest,
  UpdateResumeResponse,
} from "@shared/model"
import type { RequestOptions } from "@/lib/request"
import { localServer } from "@/api/local/server"
import { request } from "@/lib/request"
import { runInMode } from "@/lib/trial-mode"

export const resume = {
  /**
   * @description 取当前账号的简历摘要列表
   */
  list: (options?: RequestOptions) => runInMode(mode => mode === "trial"
    ? localServer.resume.list(options)
    : request<ListResumesResponse>("/resume", { ...options, method: "GET" })),

  /**
   * @description 取单份简历
   */
  get: (id: number, options?: RequestOptions) => runInMode(mode => mode === "trial"
    ? localServer.resume.get(id, options)
    : request<GetResumeResponse>(`/resume/${id}`, { ...options, method: "GET" })),

  /**
   * @description 新建简历
   */
  create: (data: CreateResumeRequest, options?: RequestOptions) =>
    runInMode(mode => mode === "trial"
      ? localServer.resume.create(data, options)
      : request<CreateResumeResponse>("/resume", { ...options, method: "POST", body: data })),

  /**
   * @description 全量更新简历
   */
  update: (id: number, data: UpdateResumeRequest, options?: RequestOptions) =>
    runInMode(mode => mode === "trial"
      ? localServer.resume.update(id, data, options)
      : request<UpdateResumeResponse>(`/resume/${id}`, { ...options, method: "PUT", body: data })),

  /**
   * @description 重命名简历
   */
  rename: (id: number, data: RenameResumeRequest, options?: RequestOptions) =>
    runInMode(mode => mode === "trial"
      ? localServer.resume.rename(id, data, options)
      : request<RenameResumeResponse>(`/resume/${id}`, { ...options, method: "PATCH", body: data })),

  /**
   * @description 删除简历
   */
  remove: (id: number, options?: RequestOptions) => runInMode(mode => mode === "trial"
    ? localServer.resume.remove(id, options)
    : request<null>(`/resume/${id}`, { ...options, method: "DELETE" })),
}
