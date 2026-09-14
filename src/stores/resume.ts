import type { Resume } from "@shared/model"
import { create } from "zustand"

/**
 * @description 全局共享的当前打开简历, 列表与 Main 各自从中读取所需字段
 */
export interface ResumeStore {
  currentId: number | null
  current: Resume | null
  open: (id: number, resume: Resume) => void
  close: () => void
}

export const useResumeStore = create<ResumeStore>()(set => ({
  currentId: null,
  current: null,
  open: (id, resume) => set({ currentId: id, current: resume }),
  close: () => set({ currentId: null, current: null }),
}))
