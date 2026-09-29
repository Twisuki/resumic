import type {
  ActivateAiConfigResponse,
  AiConfigDto,
  CreateAiConfigRequest,
  CreateAiConfigResponse,
  UpdateAiConfigRequest,
  UpdateAiConfigResponse,
} from "@shared/model"
import type { ApiClientError } from "@/lib/request"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { keys } from "@/hooks/query/key"

/**
 * @description 当前账号的 AI 配置列表 (含每条 isActive 派生标记)
 */
export function useAiConfigs() {
  return useQuery<AiConfigDto[], ApiClientError>({
    queryKey: keys.ai.configs.list(),
    queryFn: ({ signal }) => api.ai.listConfigs({ signal }),
  })
}

/**
 * @description 从 list 派生当前 active 配置 (无 active 时返回 null, UI 进空状态)
 */
export function useActiveConfig(): AiConfigDto | null {
  const { data } = useAiConfigs()
  return data?.find(c => c.isActive) ?? null
}

/**
 * @description 新建 AI 配置
 */
export function useCreateConfig() {
  const queryClient = useQueryClient()
  return useMutation<CreateAiConfigResponse, ApiClientError, CreateAiConfigRequest>({
    mutationFn: data => api.ai.createConfig(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.ai.configs.list() })
    },
  })
}

/**
 * @description 部分更新 AI 配置 (key 不传则保持)
 */
export function useUpdateConfig() {
  const queryClient = useQueryClient()
  return useMutation<UpdateAiConfigResponse, ApiClientError, { id: string, data: UpdateAiConfigRequest }>({
    mutationFn: ({ id, data }) => api.ai.updateConfig(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.ai.configs.list() })
    },
  })
}

/**
 * @description 删除 AI 配置 (若删的是 active, server 会清掉 User.activeConfigId)
 */
export function useDeleteConfig() {
  const queryClient = useQueryClient()
  return useMutation<null, ApiClientError, string>({
    mutationFn: id => api.ai.deleteConfig(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.ai.configs.list() })
    },
  })
}

/**
 * @description 把指定配置设为 active (同 user 内单选, server 端切换 User.activeConfigId)
 */
export function useActivateConfig() {
  const queryClient = useQueryClient()
  return useMutation<ActivateAiConfigResponse, ApiClientError, string>({
    mutationFn: id => api.ai.activateConfig(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.ai.configs.list() })
    },
  })
}
