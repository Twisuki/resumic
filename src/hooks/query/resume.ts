import type { ListResumesResponse, Resume, UpdateResumeRequest, UpdateResumeResponse } from "@shared/model"
import type { ApiClientError } from "@/lib/request"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { keys } from "@/hooks/query/key"
import { useResume } from "@/hooks/resume"

/**
 * @description 当前账号的简历摘要列表
 */
export function useResumeList() {
  return useQuery<ListResumesResponse, ApiClientError>({
    queryKey: keys.resume.lists(),
    queryFn: ({ signal }) => api.resume.list({ signal }),
  })
}

/**
 * @description 拉取单份简历, 成功后写入全局 store
 */
export function useResumeOpen() {
  const { open } = useResume()
  return useMutation({
    mutationFn: (id: number) => api.resume.get(id),
    onSuccess: (data, id) => open(id, data),
  })
}

/**
 * @description 拉取单份简历 (查询式, 不写 store)
 *
 * 主要给打印页等"用完即弃"的场景: 调用方自己根据 data 决定写不写 store.
 * disabled 选项让非法 id 直接停在 pending, 不打接口.
 */
export function useResumeDetail(id: number, options?: { enabled?: boolean }) {
  return useQuery<Resume, ApiClientError>({
    queryKey: keys.resume.detail(id),
    queryFn: ({ signal }) => api.resume.get(id, { signal }),
    enabled: (options?.enabled ?? true) && Number.isInteger(id) && id > 0,
  })
}

/**
 * @description 新建简历, 成功后打开并刷新列表
 */
export function useResumeCreate() {
  const { open } = useResume()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Resume) => api.resume.create(data),
    onSuccess: (res) => {
      open(res.id, res.data)
      void queryClient.invalidateQueries({ queryKey: keys.resume.lists() })
    },
  })
}

/**
 * @description 复制简历, 复用现有 create 接口, 但不自动 open 新简历 (避免打断用户上下文)
 */
export function useResumeDuplicate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Resume) => api.resume.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.resume.lists() })
    },
  })
}

/**
 * @description 删除简历, 若删的是当前打开项则清空 store, 并刷新列表
 */
export function useResumeDelete() {
  const { id: currentId, close } = useResume()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.resume.remove(id),
    onSuccess: (_data, deletedId) => {
      if (currentId === deletedId) {
        close()
      }
      void queryClient.invalidateQueries({ queryKey: keys.resume.lists() })
    },
  })
}

/**
 * @description 重命名简历, 若改的是当前打开项则同步 store, 并刷新列表
 */
export function useResumeRename() {
  const { id: currentId, open } = useResume()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: number, title: string }) => api.resume.rename(id, { title }),
    onSuccess: (data, { id: renamedId }) => {
      if (currentId === renamedId) {
        open(renamedId, data)
      }
      void queryClient.invalidateQueries({ queryKey: keys.resume.lists() })
    },
  })
}

/**
 * @description 全量更新简历, 持久化快照
 */
export function useResumeUpdate() {
  return useMutation<UpdateResumeResponse, ApiClientError, { id: number, data: UpdateResumeRequest }>({
    mutationFn: ({ id, data }) => api.resume.update(id, data),
  })
}
