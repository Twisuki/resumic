import type { Patch, PatchAction } from "@shared/model/patch"
import type { HistoryStore } from "@/stores/history/interface"
import {
  fieldSetPatch,
  itemAddPatch,
  itemRemovePatch,
  itemUpdatePatch,
  reorderPatch,
} from "@/lib/patch/derive"
import { useResumeStore } from "@/stores/resume"

/**
 * @description patch 统一入口工厂, 按 type 分发到对应 derive + commit
 */
export function createPatch(_set: (partial: Partial<HistoryStore>) => void, get: () => HistoryStore) {
  return ((type: PatchAction, path: string[], ...args: unknown[]): void => {
    const current = useResumeStore.getState().current
    if (!current)
      return

    let patch: Patch | null = null

    switch (type) {
      case "field_set":
        patch = fieldSetPatch(current, path, args[0])
        break
      case "item_add":
        patch = itemAddPatch(current, path, args[0] as { id: string }, args[1] as number | undefined)
        break
      case "item_remove":
        patch = itemRemovePatch(current, path, args[0] as string)
        break
      case "item_update":
        patch = itemUpdatePatch(current, path, args[0])
        break
      case "reorder":
        patch = reorderPatch(current, path, args[0] as string[])
        break
    }

    if (patch)
      get().commit(patch)
  }) as HistoryStore["patch"]
}
