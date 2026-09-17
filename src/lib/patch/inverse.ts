import type { Patch } from "@shared/model/patch"

/**
 * @description 反演 patch
 */
export function inversePatch(patch: Patch): Patch {
  switch (patch.type) {
    case "UPDATE":
      return {
        type: "UPDATE",
        id: patch.id,
        payload: patch.payload,
        before: patch.after,
        after: patch.before,
      }

    case "ADD":
      return {
        type: "REMOVE",
        id: patch.id,
        payload: patch.payload,
        before: patch.after,
        after: patch.before,
      }

    case "REMOVE":
      return {
        type: "ADD",
        id: patch.id,
        payload: patch.payload,
        before: patch.after,
        after: patch.before,
      }

    case "REORDER":
      return {
        type: "REORDER",
        id: patch.id,
        payload: null,
        before: patch.after,
        after: patch.before,
      }
  }
}
