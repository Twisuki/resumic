import type { AvatarSlotResponse, ListAvatarsResponse } from "@shared/model"
import type { ApiClientError } from "@/lib/request"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { keys } from "@/hooks/query/key"

/**
 * @description 当前账号的头像槽位列表 (按 id 升序)
 */
export function useAvatarList() {
  return useQuery<ListAvatarsResponse, ApiClientError>({
    queryKey: keys.avatar.lists(),
    queryFn: ({ signal }) => api.avatar.list({ signal }),
  })
}

/**
 * @description 上传新头像槽位 (formData 含 `file` 字段)
 */
export function useAvatarCreate() {
  const queryClient = useQueryClient()
  return useMutation<AvatarSlotResponse, ApiClientError, FormData>({
    mutationFn: formData => api.avatar.create(formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.avatar.lists() })
    },
  })
}

/**
 * @description 覆盖指定槽位文件, url 不变 (formData 含 `file` 字段)
 */
export function useAvatarReplace() {
  const queryClient = useQueryClient()
  return useMutation<AvatarSlotResponse, ApiClientError, { id: number, formData: FormData }>({
    mutationFn: ({ id, formData }) => api.avatar.replace(id, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.avatar.lists() })
    },
  })
}

/**
 * @description 删除指定槽位 (不做引用检查, 简历侧 url 失效自负)
 */
export function useAvatarRemove() {
  const queryClient = useQueryClient()
  return useMutation<null, ApiClientError, number>({
    mutationFn: id => api.avatar.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.avatar.lists() })
    },
  })
}
