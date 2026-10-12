import type { History } from "@shared/model/patch"
import type { Resume } from "@shared/model/resume"
import { create } from "zustand"

/**
 * @description 保存触发来源: auto 为历史阈值触发的自动保存, manual 为用户点击
 */
export type SaveReason = "auto" | "manual"

export interface SavedResume {
  id: number
  data: Resume
}

/** @description 保存传输使用捕获的简历 ID 和快照, 不重读当前编辑器 */
export type SaveFn = (snapshot: SavedResume, reason: SaveReason) => Promise<void>

/**
 * @description 简历历史 store (纯状态容器, 编排逻辑见 hooks/history.ts)
 */
export interface HistoryStore {
  history: History
  isSaving: boolean
  saveFn: SaveFn | null

  setHistory: (history: History) => void
  setSaving: (isSaving: boolean) => void
  setSaveFn: (saveFn: SaveFn | null) => void
  reset: () => void
}

export const useHistoryStore = create<HistoryStore>()(set => ({
  history: {
    past: [],
    future: [],
  },
  isSaving: false,
  saveFn: null,

  setHistory: history => set({ history }),
  setSaving: isSaving => set({ isSaving }),
  setSaveFn: saveFn => set({ saveFn }),
  reset: () => set({ history: { past: [], future: [] }, isSaving: false }),
}))
