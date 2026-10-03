import type { Node } from "@shared/model/node"
import { moveNodeInput } from "@shared/ai/tool"
import { tool } from "ai"
import { checkAndAct } from "@/hooks/ai/tools/permission"
import { findTreeForNode } from "@/hooks/ai/tools/serialize"
import { patch } from "@/hooks/history"

/**
 * @description 由 self 形状推断节点 kind, 仅用于校验两个 parent 同级别
 */
function getKind(self: unknown): string | null {
  if (self === null)
    return "page"
  if (typeof self === "object" && self !== null) {
    if ("zoom" in self)
      return "root"
    if ("name" in self)
      return "profile"
    if ("subtitle" in self)
      return "part"
    if ("icon" in self && "content" in self)
      return "detail"
    if ("icon" in self && "title" in self)
      return "section"
    if ("content" in self)
      return "line"
  }
  return null
}

/**
 * @description 跨父移动: patch.remove 拿到子树快照 + patch.add 挂到新父 + 可选 patch.reorder 调整位置; 节点本身不动, 整棵子树跟随, 无数据丢失; 仅 patch 层的高级组合, 不引入新 patch 类型
 *
 * 同级别校验: parentId 与 newParentId 必须同树 + 同 kind, 否则直接抛错
 */
export const moveNodeTool = tool({
  description: "Move a child node to a new parent of the same kind (e.g. section between pages, part between sections, line between parts). The full subtree follows — no children lost. Composed from remove + add + optional reorder.",
  inputSchema: moveNodeInput,
  execute: async ({ parentId, childId, newParentId, insertIndex }) => {
    if (!(await checkAndAct("move_node", "ask", { parentId, childId, newParentId, insertIndex })))
      return { error: "denied by user" }
    try {
      const from = findTreeForNode(parentId)
      const to = findTreeForNode(newParentId)
      if (!from || !to)
        return { error: "parent not found" }
      if (from.tree !== to.tree)
        return { error: "parents must be in the same tree" }
      if (getKind((from.node as Node).self) !== getKind((to.node as Node).self))
        return { error: "parents must be the same kind" }

      const subtree = patch.remove(parentId, childId)
      if (subtree === null)
        return { error: `child ${childId} not under ${parentId}` }
      patch.add(newParentId, subtree)
      if (insertIndex !== undefined) {
        const order = to.node.children.filter(id => id !== childId)
        order.splice(insertIndex, 0, childId)
        patch.reorder(newParentId, order)
      }
      return { success: true, parentId, childId, newParentId, insertIndex }
    }
    catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  },
})
