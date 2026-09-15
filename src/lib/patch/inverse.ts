import type { ItemAddPatch, ItemRemovePatch, Patch, ReorderPatch } from "@shared/model/patch"

/**
 * @description 反演 patch
 */
export function inverse(patch: Patch): Patch {
  switch (patch.type) {
    case "field_set":
      return { type: "field_set", path: patch.path, payload: null, before: patch.after, after: patch.before }
    case "item_add": {
      const p = patch as ItemAddPatch
      return {
        type: "item_remove",
        path: p.path,
        payload: p.payload,
        before: p.after,
        after: p.before,
      }
    }
    case "item_remove": {
      const p = patch as ItemRemovePatch
      return {
        type: "item_add",
        path: p.path,
        payload: p.payload,
        before: p.after,
        after: p.before,
      }
    }
    case "item_update":
      return { type: "item_update", path: patch.path, payload: null, before: patch.after, after: patch.before }
    case "reorder": {
      const p = patch as ReorderPatch
      return {
        type: "reorder",
        path: p.path,
        payload: null,
        before: p.after,
        after: p.before,
      }
    }
  }
}
