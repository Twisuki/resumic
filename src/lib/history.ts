import type { Resume } from "@shared/model"
import type { History, Patch } from "@shared/model/patch"
import { KEEP_AFTER_SAVE } from "@/config/history"
import { applyPatch } from "@/lib/patch/apply"
import { inverse } from "@/lib/patch/inverse"

/**
 * @description 提交 patch, 应用到 resume 并推入 history, 清空 future
 */
export function commit(resume: Resume, patch: Patch, history: History): { resume: Resume, history: History } {
  return {
    resume: applyPatch(resume, patch),
    history: {
      past: [...history.past, patch],
      future: [],
    },
  }
}

/**
 * @description 撤销最近一条, 应用 inverse 并移到 future
 */
export function undo(resume: Resume, history: History): { resume: Resume, history: History } | null {
  if (history.past.length === 0)
    return null
  const last = history.past[history.past.length - 1]
  return {
    resume: applyPatch(resume, inverse(last)),
    history: {
      past: history.past.slice(0, -1),
      future: [...history.future, last],
    },
  }
}

/**
 * @description 重做最近一条, 应用原 patch 并移回 past
 */
export function redo(resume: Resume, history: History): { resume: Resume, history: History } | null {
  if (history.future.length === 0)
    return null
  const last = history.future[history.future.length - 1]
  return {
    resume: applyPatch(resume, last),
    history: {
      past: [...history.past, last],
      future: history.future.slice(0, -1),
    },
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
