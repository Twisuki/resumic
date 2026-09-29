import { readStructureInput } from "@shared/ai/tool"
import { tool } from "ai"
import { walkFromNode, walkResumeRoot } from "@/hooks/ai/tools/serialize"

/**
 * @description 读取简历树 (line 省略 / part 露标题 / detail 露图标); 不传 nodeId = resume 根
 */
export const readStructureTool = tool({
  description: "Read the resume tree structure as nested JSON. Lines omitted, parts show title only, details show icon only. Pass nodeId to start from a sub-node; omit to start from the resume root.",
  inputSchema: readStructureInput,
  execute: async ({ nodeId }) => {
    try {
      const tree = nodeId ? walkFromNode(nodeId, "structure") : walkResumeRoot("structure")
      if (tree === null)
        return { error: nodeId ? `node ${nodeId} not found` : "no resume loaded" }
      return { tree }
    }
    catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  },
})
