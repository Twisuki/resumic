import type { Tree } from "@shared/model/node"
import type { History, Patch } from "@shared/model/patch"
import type { Resume } from "@shared/model/resume"
import { create } from "zustand"
import { SAVE_THRESHOLD } from "@/config/history"
import {
  commit as commitFn,
  redo as redoFn,
  truncateAfterSave,
  undo as undoFn,
} from "@/lib/history"
import { applyPatch, inversePatch } from "@/lib/patch"
import { deserialize } from "@/lib/tree"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 简历历史 store
 */
export interface HistoryStore {
  history: History
  isSaving: boolean
  saveFn: ((snapshot: Resume) => void) | null

  commit: (patch: Patch) => void
  undo: () => void
  redo: () => void
  reset: () => void
  save: () => void
  registerSave: (saveFn: (snapshot: Resume) => void) => void
  finishSave: (success: boolean) => void
}

type RoutedTree = "profile" | "resume"

/**
 * @description 把 patch 路由到正确的树
 */
function routePatch(profile: Tree, resume: Tree, p: Patch): { which: RoutedTree, tree: Tree } {
  if (p.type === "UPDATE") {
    return profile.nodes.has(p.id)
      ? { which: "profile", tree: profile }
      : { which: "resume", tree: resume }
  }
  return p.id === profile.rootId
    ? { which: "profile", tree: profile }
    : { which: "resume", tree: resume }
}

/**
 * @description 应用 patch 到正确的树并返回新值
 */
function computeHistoryPatch(profile: Tree, resume: Tree, patch: Patch): { which: RoutedTree, tree: Tree } {
  const { which, tree } = routePatch(profile, resume, patch)
  return { which, tree: applyPatch(tree, patch) }
}

export const useHistoryStore = create<HistoryStore>()((set, get) => ({
  history: {
    past: [] as Patch[],
    future: [] as Patch[],
  },
  isSaving: false,
  saveFn: null,

  /**
   * @description 推入 history, 清空 future, 阈值触发自动保存
   */
  commit(patch) {
    set(state => ({ history: commitFn(state.history, patch) }))

    const { history, isSaving, saveFn } = get()
    if (history.past.length >= SAVE_THRESHOLD && !isSaving && saveFn) {
      set({ isSaving: true })
      const trees = useResumeStore.getState()
      if (trees.profile && trees.resume) {
        saveFn(deserialize({ profile: trees.profile, resume: trees.resume }))
      }
    }
  },

  /**
   * @description 撤销最近一条: 应用 inverse 到树 + 移到 future
   */
  undo() {
    const result = undoFn(get().history)
    if (!result)
      return

    const { profile, resume } = useResumeStore.getState()
    if (!profile || !resume)
      return

    const { which, tree } = computeHistoryPatch(profile, resume, inversePatch(result.patch))
    useResumeStore.setState(which === "profile" ? { profile: tree } : { resume: tree })
    set({ history: result.history })
  },

  /**
   * @description 重做最近一条: 应用 forward 到树 + 推回 past
   */
  redo() {
    const result = redoFn(get().history)
    if (!result)
      return

    const { profile, resume } = useResumeStore.getState()
    if (!profile || !resume)
      return

    const { which, tree } = computeHistoryPatch(profile, resume, result.patch)
    useResumeStore.setState(which === "profile" ? { profile: tree } : { resume: tree })
    set({ history: result.history })
  },

  /**
   * @description 清空 history 栈与 isSaving
   */
  reset() {
    set({ history: { past: [], future: [] }, isSaving: false })
  },

  /**
   * @description 手动触发 saveFn, isSaving 防重入
   */
  save() {
    const { isSaving, saveFn } = get()
    if (isSaving || !saveFn)
      return
    const trees = useResumeStore.getState()
    if (!trees.profile || !trees.resume)
      return
    set({ isSaving: true })
    saveFn(deserialize({ profile: trees.profile, resume: trees.resume }))
  },

  /**
   * @description 注册 saveFn (低层操作)
   */
  registerSave(saveFn) {
    set({ saveFn })
  },

  /**
   * @description 保存完成回调, success 时裁剪 history 到 KEEP_AFTER_SAVE
   */
  finishSave(success) {
    set({ isSaving: false })
    if (success) {
      const { history } = get()
      set({ history: truncateAfterSave(history) })
    }
  },
}))
