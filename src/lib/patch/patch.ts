import type { Node, Tree } from "@shared/model/node"
import type {
  AddPatch,
  Patch,
  RemovePatch,
  ReorderPatch,
  UpdatePatch,
} from "@shared/model/patch"
import { enableMapSet, produce } from "immer"
import { deepCloneNode, registerSubtree, unregisterSubtree } from "@/lib/tree"

enableMapSet()

interface PatchResult<P extends Patch> {
  tree: Tree
  patch: P
}

/**
 * @description 数组相等
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length)
    return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i])
      return false
  }
  return true
}

/**
 * @description 修改行为返回 patch
 */
export const patch = {
  update(
    tree: Tree,
    id: string,
    key: string,
    after: unknown,
  ): PatchResult<UpdatePatch> | null {
    const node = tree.nodes.get(id)
    if (!node)
      return null
    const before = (node.self as Record<string, unknown>)[key]
    if (before === after)
      return null
    const newTree = produce(tree, (draft) => {
      const draftNode = draft.nodes.get(id)
      if (!draftNode)
        return
      (draftNode.self as Record<string, unknown>)[key] = after
    }) as Tree
    return {
      tree: newTree,
      patch: { type: "UPDATE", id, payload: key, before, after },
    }
  },

  add(
    tree: Tree,
    parentId: string,
    payload: Node,
  ): PatchResult<AddPatch> {
    const parent = tree.nodes.get(parentId)
    if (!parent)
      throw new Error(`patch.add: parent ${parentId} not found`)
    const before = [...parent.children]
    const after = [...before, payload.id]
    const newTree = produce(tree, (draft) => {
      registerSubtree(draft.nodes, payload)
      const draftParent = draft.nodes.get(parentId)
      if (!draftParent)
        return
      draftParent.children = after
    }) as Tree
    return {
      tree: newTree,
      patch: { type: "ADD", id: parentId, payload, before, after },
    }
  },

  remove(
    tree: Tree,
    parentId: string,
    childId: string,
  ): PatchResult<RemovePatch> {
    const parent = tree.nodes.get(parentId)
    const child = tree.nodes.get(childId)
    if (!parent || !child)
      throw new Error(`patch.remove: parent or child not found`)
    const before = [...parent.children]
    const after = before.filter(id => id !== childId)
    const newTree = produce(tree, (draft) => {
      unregisterSubtree(draft.nodes, child)
      const draftParent = draft.nodes.get(parentId)
      if (!draftParent)
        return
      draftParent.children = after
    }) as Tree
    return {
      tree: newTree,
      patch: { type: "REMOVE", id: parentId, payload: deepCloneNode(child), before, after },
    }
  },

  reorder(
    tree: Tree,
    parentId: string,
    afterOrders: string[],
  ): PatchResult<ReorderPatch> | null {
    const parent = tree.nodes.get(parentId)
    if (!parent)
      return null
    const before = [...parent.children]
    if (arraysEqual(before, afterOrders))
      return null
    const newTree = produce(tree, (draft) => {
      const draftParent = draft.nodes.get(parentId)
      if (!draftParent)
        return
      draftParent.children = afterOrders
    }) as Tree
    return {
      tree: newTree,
      patch: { type: "REORDER", id: parentId, payload: null, before, after: afterOrders },
    }
  },
}
