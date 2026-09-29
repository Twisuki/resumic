import { replaceFieldInput } from "@shared/ai/tool"
import { tool } from "ai"
import { checkAndAct } from "@/hooks/ai/tools/permission"
import { patch } from "@/hooks/history"

/**
 * @description 修改单个节点的 self 字段, 走 patch.update (进入 history, 可撤销)
 */
export const replaceFieldTool = tool({
  description: "Replace a single self field on a node. nodeId identifies the node, key is the field name in self, value is the new value. Reversible via history.",
  inputSchema: replaceFieldInput,
  execute: async ({ nodeId, key, value }) => {
    if (!(await checkAndAct("replace_field", "ask", { nodeId, key, value })))
      return { error: "denied by user" }
    try {
      patch.update(nodeId, key, value)
      return { success: true, nodeId, key, value }
    }
    catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  },
})
