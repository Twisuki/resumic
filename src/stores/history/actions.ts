import type { Resume } from "@shared/model"
import type { HistoryStore } from "@/stores/history/interface"
import {
  canRedo as canRedoFn,
  canUndo as canUndoFn,
  redo as redoFn,
  truncateAfterSave,
  undo as undoFn,
} from "@/lib/history"
import { useResumeStore } from "@/stores/resume"

/**
 * @description undo action 工厂
 */
export function createUndo(set: (partial: Partial<HistoryStore>) => void, get: () => HistoryStore) {
  return (): void => {
    const current = useResumeStore.getState().current
    if (!current)
      return

    const result = undoFn(current, {
      past: get().past,
      future: get().future,
    })
    if (!result)
      return

    useResumeStore.setState({ current: result.resume })
    set({ past: result.history.past, future: result.history.future })
  }
}

/**
 * @description redo action 工厂
 */
export function createRedo(set: (partial: Partial<HistoryStore>) => void, get: () => HistoryStore) {
  return (): void => {
    const current = useResumeStore.getState().current
    if (!current)
      return

    const result = redoFn(current, {
      past: get().past,
      future: get().future,
    })
    if (!result)
      return

    useResumeStore.setState({ current: result.resume })
    set({ past: result.history.past, future: result.history.future })
  }
}

/**
 * @description canUndo 派生查询
 */
export function createCanUndo(_set: (partial: Partial<HistoryStore>) => void, get: () => HistoryStore) {
  return (): boolean => canUndoFn({ past: get().past, future: get().future })
}

/**
 * @description canRedo 派生查询
 */
export function createCanRedo(_set: (partial: Partial<HistoryStore>) => void, get: () => HistoryStore) {
  return (): boolean => canRedoFn({ past: get().past, future: get().future })
}

/**
 * @description reset 清空栈与 isSaving
 */
export function createReset(set: (partial: Partial<HistoryStore>) => void) {
  return (): void => {
    set({ past: [], future: [], isSaving: false })
  }
}

/**
 * @description registerSave UI 注入保存实现
 */
export function createRegisterSave(set: (partial: Partial<HistoryStore>) => void) {
  return (saveFn: (snapshot: Resume) => void): void => {
    set({ saveFn })
  }
}

/**
 * @description finishSave 保存完成回调, 成功裁剪到 KEEP_AFTER_SAVE
 */
export function createFinishSave(set: (partial: Partial<HistoryStore>) => void, get: () => HistoryStore) {
  return (success: boolean): void => {
    set({ isSaving: false })
    if (success) {
      const { past, future } = get()
      set(truncateAfterSave({ past, future }))
    }
  }
}
