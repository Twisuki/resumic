import type { Resume, Tree } from "@shared/model"
import { create } from "zustand"
import { serialize } from "@/lib/tree"
import { useHistoryStore } from "@/stores/history"

/**
 * @description 全局共享的当前简历
 */
export interface ResumeStore {
  id: number | null
  profile: Tree | null
  resume: Tree | null
  open: (id: number, resume: Resume) => void
  close: () => void
}

export const useResumeStore = create<ResumeStore>()(set => ({
  id: null,
  profile: null,
  resume: null,
  open: (id, resume) => {
    const trees = serialize(resume)
    useHistoryStore.getState().reset()
    set({ id, profile: trees.profile, resume: trees.resume })
  },
  close: () => {
    useHistoryStore.getState().reset()
    set({ id: null, profile: null, resume: null })
  },
}))
