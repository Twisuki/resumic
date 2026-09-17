import type { Tree } from "@shared/model/node"
import type { Patch } from "@shared/model/patch"
import { enableMapSet, produce } from "immer"
import { registerSubtree, unregisterSubtree } from "@/lib/tree"

enableMapSet()

/**
 * @description 应用 patch 到 tree
 */
export function applyPatch(tree: Tree, patch: Patch): Tree {
  switch (patch.type) {
    case "UPDATE":
      return produce(tree, (draft) => {
        const node = draft.nodes.get(patch.id)
        if (!node)
          return
        (node.self as Record<string, unknown>)[patch.payload] = patch.after
      }) as Tree

    case "ADD":
      return produce(tree, (draft) => {
        registerSubtree(draft.nodes, patch.payload)
        const parent = draft.nodes.get(patch.id)
        if (!parent)
          return
        parent.children = patch.after
      }) as Tree

    case "REMOVE":
      return produce(tree, (draft) => {
        unregisterSubtree(draft.nodes, patch.payload)
        const parent = draft.nodes.get(patch.id)
        if (!parent)
          return
        parent.children = patch.after
      }) as Tree

    case "REORDER":
      return produce(tree, (draft) => {
        const parent = draft.nodes.get(patch.id)
        if (!parent)
          return
        parent.children = patch.after
      }) as Tree
  }
}
