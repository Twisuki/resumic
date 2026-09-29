import type { Node } from "@shared/model/node"
import { insertNodeInput } from "@shared/ai/tool"
import { tool } from "ai"
import { checkAndAct } from "@/hooks/ai/tools/permission"
import { patch } from "@/hooks/history"
import { genId } from "@/lib/id"

/**
 * @description 在 parent 下追加一个节点; kind + self 由模型给定, id 客户端 gen 后走 patch.add
 */
export const insertNodeTool = tool({
  description: "Insert a new node under parentId. Specify kind (detail/page/section/part/line) and the matching self fields. id is generated client-side. Reversible via history.",
  inputSchema: insertNodeInput,
  execute: async ({ parentId, node }) => {
    if (!(await checkAndAct("insert_node", "ask", { parentId, kind: node.kind })))
      return { error: "denied by user" }
    try {
      const id = genId()
      const newNode = { id, self: node.self as Node["self"], children: node.children ?? [] } as Node
      patch.add(parentId, newNode)
      return { success: true, nodeId: id, parentId, kind: node.kind }
    }
    catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  },
})
