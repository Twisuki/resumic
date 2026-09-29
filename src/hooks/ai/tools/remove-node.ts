import { removeNodeInput } from "@shared/ai/tool"
import { tool } from "ai"
import { checkAndAct } from "@/hooks/ai/tools/permission"
import { patch } from "@/hooks/history"

/**
 * @description 删除 parent 下的 child, 走 patch.remove (进入 history, 可撤销)
 */
export const removeNodeTool = tool({
  description: "Remove a child node from its parent. Subtree is snapshotted into the patch for undo. Reversible via history.",
  inputSchema: removeNodeInput,
  execute: async ({ parentId, childId }) => {
    if (!(await checkAndAct("remove_node", "ask", { parentId, childId })))
      return { error: "denied by user" }
    try {
      const subtree = patch.remove(parentId, childId)
      if (subtree === null)
        return { error: `child ${childId} not under ${parentId}` }
      return { success: true, parentId, childId }
    }
    catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  },
})
