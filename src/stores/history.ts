import type { Tree } from "@shared/model/node"
import type { History, Patch } from "@shared/model/patch"
import type { Resume } from "@shared/model/resume"
import { create } from "zustand"
import { SAVE_THRESHOLD } from "@/config/history"
import {
  commit as commitHistory,
  redo as redoHistory,
  truncateAfterSave,
  undo as undoHistory,
} from "@/lib/history"
import { patch as libPatch } from "@/lib/patch"
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

/**
 * @description 对应方向应用 patch 到正确树, 返回新树 (只含被改的那棵)
 */
function applyToTrees(
  profile: Tree,
  resume: Tree,
  p: Patch,
  direction: "inverse" | "forward",
): { profile?: Tree, resume?: Tree } {
  const treeKey = p.type === "UPDATE"
    ? (profile.nodes.has(p.id) ? "profile" : "resume")
    : (p.id === profile.rootId ? "profile" : "resume")

  const tree = treeKey === "profile" ? profile : resume

  let newTree: Tree
  if (direction === "inverse") {
    switch (p.type) {
      case "UPDATE":
        newTree = libPatch.update(tree, p.id, p.payload, p.before)!.tree
        break
      case "ADD":
        newTree = libPatch.remove(tree, p.id, p.payload.id)!.tree
        break
      case "REMOVE":
        newTree = libPatch.add(tree, p.id, p.payload).tree
        break
      case "REORDER":
        newTree = libPatch.reorder(tree, p.id, p.before)!.tree
        break
    }
  }
  else {
    switch (p.type) {
      case "UPDATE":
        newTree = libPatch.update(tree, p.id, p.payload, p.after)!.tree
        break
      case "ADD":
        newTree = libPatch.add(tree, p.id, p.payload).tree
        break
      case "REMOVE":
        newTree = libPatch.remove(tree, p.id, p.payload.id)!.tree
        break
      case "REORDER":
        newTree = libPatch.reorder(tree, p.id, p.after)!.tree
        break
    }
  }

  return { [treeKey]: newTree }
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
    set(state => ({ history: commitHistory(state.history, patch) }))

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
    const result = undoHistory(get().history)
    if (!result)
      return

    const trees = useResumeStore.getState()
    if (!trees.profile || !trees.resume)
      return

    const newTrees = applyToTrees(trees.profile, trees.resume, result.patch, "inverse")
    useResumeStore.setState({ ...trees, ...newTrees })
    set({ history: result.history })
  },

  /**
   * @description 重做最近一条: 应用 forward 到树 + 推回 past
   */
  redo() {
    const result = redoHistory(get().history)
    if (!result)
      return

    const trees = useResumeStore.getState()
    if (!trees.profile || !trees.resume)
      return

    const newTrees = applyToTrees(trees.profile, trees.resume, result.patch, "forward")
    useResumeStore.setState({ ...trees, ...newTrees })
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
