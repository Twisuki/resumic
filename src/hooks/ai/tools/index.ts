import type { ToolExecutionOptions } from "ai"
import type { createAiRun } from "@/lib/ai-runtime"
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

function bindTool<T extends (typeof tools)[keyof typeof tools]>(definition: T, run: ReturnType<typeof createAiRun>): T {
  return {
    ...definition,
    execute: async (args: never, options: ToolExecutionOptions<never>) => {
      run.assertActive()
      const result = await definition.execute?.(args, { ...options, abortSignal: run.controller.signal })
      run.assertActive()
      return result
    },
  } as T
}

/** @description 每次工具调用前后核对 AI 会话, 并传递同一取消信号 */
export function toolsForRun(run: ReturnType<typeof createAiRun>): typeof tools {
  return {
    read_structure: bindTool(readStructureTool, run),
    read_content: bindTool(readContentTool, run),
    read_profile: bindTool(readProfileTool, run),
    replace_field: bindTool(replaceFieldTool, run),
    insert_node: bindTool(insertNodeTool, run),
    remove_node: bindTool(removeNodeTool, run),
    reorder_nodes: bindTool(reorderNodesTool, run),
    move_node: bindTool(moveNodeTool, run),
  }
}
