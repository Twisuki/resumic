import type { History, Patch } from "@shared/model/patch"
import { KEEP_AFTER_SAVE } from "@/config/history"

/**
 * @description 提交 patch 到 history 栈, 清空 future
 */
export function commit(history: History, newPatch: Patch): History {
  return {
    past: [...history.past, newPatch],
    future: [],
  }
}

/**
 * @description 撤销最近一条, 移到 future, 返回该 patch
 */
export function undo(history: History): { history: History, patch: Patch } | null {
  if (history.past.length === 0)
    return null
  const last = history.past[history.past.length - 1]
  return {
    history: {
      past: history.past.slice(0, -1),
      future: [...history.future, last],
    },
    patch: last,
  }
}

/**
 * @description 重做最近一条, 推回 past, 返回该 patch
 */
export function redo(history: History): { history: History, patch: Patch } | null {
  if (history.future.length === 0)
    return null
  const last = history.future[history.future.length - 1]
  return {
    history: {
      past: [...history.past, last],
      future: history.future.slice(0, -1),
    },
    patch: last,
  }
}

/**
 * @description 保存完成后裁剪历史栈, future 保留
 */
export function truncateAfterSave(history: History): History {
  return {
    past: history.past.slice(-KEEP_AFTER_SAVE),
    future: history.future,
  }
}

/**
 * @description 是否可 undo
 */
export function canUndo(history: History): boolean {
  return history.past.length > 0
}

/**
 * @description 是否可 redo
 */
export function canRedo(history: History): boolean {
  return history.future.length > 0
}
