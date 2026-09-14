import type { ListResumesResponse, Resume } from "@shared/model"
import type { ApiClientError } from "@/lib/request"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { keys } from "@/hooks/query/key"
import { useResumeStore } from "@/stores/resume"

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
  const open = useResumeStore(state => state.open)
  return useMutation({
    mutationFn: (id: number) => api.resume.get(id),
    onSuccess: (data, id) => open(id, data),
  })
}

/**
 * @description 新建简历, 成功后打开并刷新列表
 */
export function useResumeCreate() {
  const open = useResumeStore(state => state.open)
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.resume.remove(id),
    onSuccess: (_data, id) => {
      const store = useResumeStore.getState()
      if (store.currentId === id) {
        store.close()
      }
      void queryClient.invalidateQueries({ queryKey: keys.resume.lists() })
    },
  })
}

/**
 * @description 重命名简历, 若改的是当前打开项则同步 store, 并刷新列表
 */
export function useResumeRename() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: number, title: string }) => api.resume.rename(id, { title }),
    onSuccess: (data, { id }) => {
      const store = useResumeStore.getState()
      if (store.currentId === id) {
        store.open(id, data)
      }
      void queryClient.invalidateQueries({ queryKey: keys.resume.lists() })
    },
  })
}
