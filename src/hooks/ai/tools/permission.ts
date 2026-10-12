import type { Permission, ToolName } from "@shared/ai/tool"
import { getTrialSnapshot, isEditorReady } from "@/lib/trial-mode"
import { useAiPermissionStore } from "@/stores/ai-permission"

/** @description 权限决议必须仍属于当前模式与未取消的 AI 会话 */
export async function checkAndAct(name: ToolName, perm: Permission, args: unknown, signal?: AbortSignal): Promise<boolean> {
  const { generation } = getTrialSnapshot()
  if (!isEditorReady() || signal?.aborted || perm === "deny")
    return false
  const { grants, request } = useAiPermissionStore.getState()
  const cached = grants.get(name)
  const allowed = await (perm === "always" || cached === "always"
    ? true
    : cached === "deny" ? false : request(name, args))
  return allowed && isEditorReady() && generation === getTrialSnapshot().generation && !signal?.aborted
}
