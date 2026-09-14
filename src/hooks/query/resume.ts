import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "@/api"
import { keys } from "@/hooks/query/key"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 当前账号的简历摘要列表
 */
export function useResumeList() {
  return useQuery({
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
