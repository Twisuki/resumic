import { reorderNodesInput } from "@shared/ai/tool"
import { tool } from "ai"
import { checkAndAct } from "@/hooks/ai/tools/permission"
import { patch } from "@/hooks/history"

/**
 * @description 调整 parent.children 的顺序, order 必须是完整新顺序, 走 patch.reorder
 */
export const reorderNodesTool = tool({
  description: "Reorder children under parentId. order must be the complete new ordering of all current child ids. Reversible via history.",
  inputSchema: reorderNodesInput,
  execute: async ({ parentId, order }) => {
    if (!(await checkAndAct("reorder_nodes", "ask", { parentId, order })))
      return { error: "denied by user" }
    try {
      patch.reorder(parentId, order)
      return { success: true, parentId, order }
    }
    catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  },
})
