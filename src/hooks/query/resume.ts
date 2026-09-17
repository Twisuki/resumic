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
