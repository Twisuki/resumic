import { useShallow } from "zustand/react/shallow"
import { useHistoryStore } from "@/stores/history"

export function useHistory() {
  return useHistoryStore(
    useShallow(s => ({
      patch: s.patch,
      commit: s.commit,
      undo: s.undo,
      redo: s.redo,
      canUndo: s.canUndo,
      canRedo: s.canRedo,
      reset: s.reset,
      registerSave: s.registerSave,
      finishSave: s.finishSave,
    })),
  )
}
