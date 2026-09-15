import type { HistoryStore } from "@/stores/history/interface"
import { create } from "zustand"
import {
  createCanRedo,
  createCanUndo,
  createFinishSave,
  createRedo,
  createRegisterSave,
  createReset,
  createUndo,
} from "@/stores/history/actions"
import { createCommit } from "@/stores/history/commit"
import { initialState } from "@/stores/history/interface"
import { createPatch } from "@/stores/history/patch"

export type { HistoryStore } from "@/stores/history/interface"

export const useHistoryStore = create<HistoryStore>()((set, get) => ({
  ...initialState,

  patch: createPatch(set, get),
  commit: createCommit(set, get),
  undo: createUndo(set, get),
  redo: createRedo(set, get),
  canUndo: createCanUndo(set, get),
  canRedo: createCanRedo(set, get),
  reset: createReset(set),
  registerSave: createRegisterSave(set),
  finishSave: createFinishSave(set, get),
}))
