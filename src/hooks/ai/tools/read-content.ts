import { readContentInput } from "@shared/ai/tool"
import { tool } from "ai"
import { findTreeForNode } from "@/hooks/ai/tools/serialize"

/**
 * @description 读取单个节点的 self 字段全量 (不带 children 详情)
 */
export const readContentTool = tool({
  description: "Read the full self fields of a single node by id, without traversing children. Use read_structure first to find ids.",
  inputSchema: readContentInput,
  execute: async ({ nodeId }) => {
    const found = findTreeForNode(nodeId)
    if (!found)
      return { error: `node ${nodeId} not found` }
    return { id: found.node.id, self: found.node.self }
  },
})
