import { insertNodeTool } from "@/hooks/ai/tools/insert-node"
import { moveNodeTool } from "@/hooks/ai/tools/move-node"
import { readContentTool } from "@/hooks/ai/tools/read-content"
import { readProfileTool } from "@/hooks/ai/tools/read-profile"
import { readStructureTool } from "@/hooks/ai/tools/read-structure"
import { removeNodeTool } from "@/hooks/ai/tools/remove-node"
import { reorderNodesTool } from "@/hooks/ai/tools/reorder-nodes"
import { replaceFieldTool } from "@/hooks/ai/tools/replace-field"

/**
 * @description AI 工具聚合, 直接喂给 streamText({ tools })
 */
export const tools = {
  read_structure: readStructureTool,
  read_content: readContentTool,
  read_profile: readProfileTool,
  replace_field: replaceFieldTool,
  insert_node: insertNodeTool,
  remove_node: removeNodeTool,
  reorder_nodes: reorderNodesTool,
  move_node: moveNodeTool,
}
