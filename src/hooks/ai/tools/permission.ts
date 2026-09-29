import type { Permission, ToolName } from "@shared/ai/tool"
import { useAiPermissionStore } from "@/stores/ai-permission"

/**
 * @description 权限闸门: always 直通, ask 查 grants 再走弹窗, deny 直接拒
 *
 * always: 直返 true
 * ask: 先查 session-level grants, 命中 always/deny 即用之, 否则写 pending 等待 UI resolve
 * deny: 直返 false (预留反相, 当前工具未使用)
 */
export async function checkAndAct(name: ToolName, perm: Permission, args: unknown): Promise<boolean> {
  if (perm === "always")
    return true
  if (perm === "deny")
    return false

  const { grants, request } = useAiPermissionStore.getState()
  const cached = grants.get(name)
  if (cached === "always")
    return true
  if (cached === "deny")
    return false

  return request(name, args)
}
