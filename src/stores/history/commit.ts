import type { Patch } from "@shared/model/patch"
import type { HistoryStore } from "@/stores/history/interface"
import { SAVE_THRESHOLD } from "@/config/history"
import { commit as commitFn } from "@/lib/history"
import { useResumeStore } from "@/stores/resume"

/**
 * @description commit action 工厂
 */
export function createCommit(set: (partial: Partial<HistoryStore>) => void, get: () => HistoryStore) {
  return (patch: Patch): void => {
    const current = useResumeStore.getState().current
    if (!current)
      return

    const result = commitFn(current, patch, {
      past: get().past,
      future: get().future,
    })

    useResumeStore.setState({ current: result.resume })
    set({ past: result.history.past, future: result.history.future })

    if (
      result.history.past.length >= SAVE_THRESHOLD
      && !get().isSaving
      && get().saveFn
    ) {
      set({ isSaving: true })
      get().saveFn!(result.resume)
    }
  }
}
