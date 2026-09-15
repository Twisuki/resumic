import type { Resume } from "@shared/model"
import type { Patch } from "@shared/model/patch"

/**
 * @description 编辑历史栈与自动保存协调
 */
export interface HistoryStore {
  past: Patch[]
  future: Patch[]
  isSaving: boolean
  saveFn: ((snapshot: Resume) => void) | null

  patch: ((type: "field_set", path: string[], value: unknown) => void) & ((type: "item_add", path: string[], item: { id: string }, at?: number) => void) & ((type: "item_remove", path: string[], id: string) => void) & ((type: "item_update", path: string[], newItem: unknown) => void) & ((type: "reorder", path: string[], newOrders: string[]) => void)

  commit: (patch: Patch) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  reset: () => void

  registerSave: (saveFn: (snapshot: Resume) => void) => void
  finishSave: (success: boolean) => void
}

/**
 * @description history store 初始 state
 */
export const initialState = {
  past: [] as Patch[],
  future: [] as Patch[],
  isSaving: false,
  saveFn: null as ((snapshot: Resume) => void) | null,
}
