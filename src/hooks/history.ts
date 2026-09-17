import type { Node, ResumeTree, Tree } from "@shared/model/node"
import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"
import { patch as libPatch } from "@/lib/patch"
import { useHistoryStore } from "@/stores/history"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 判断 id 是否在 profile 树内
 */
function isInProfile(trees: ResumeTree, id: string): boolean {
  return trees.profile.nodes.has(id)
}

/**
 * @description 把新树写回对应的完整简历树, 返回新完整简历树
 */
function writeBackTree(trees: ResumeTree, isProfile: boolean, newTree: Tree): ResumeTree {
  return isProfile
    ? { ...trees, profile: newTree }
    : { ...trees, resume: newTree }
}

/**
 * @description 历史 hook
 */
export function useHistory() {
  const isSaving = useHistoryStore(s => s.isSaving)
  const canUndo = useHistoryStore(s => s.history.past.length > 0)
  const canRedo = useHistoryStore(s => s.history.future.length > 0)

  const actions = useHistoryStore(
    useShallow(s => ({
      commit: s.commit,
      undo: s.undo,
      redo: s.redo,
      reset: s.reset,
      save: s.save,
      registerSave: s.registerSave,
      finishSave: s.finishSave,
    })),
  )

  const patch = useMemo(() => ({
    update(id: string, key: string, after: unknown): void {
      const { profile, resume } = useResumeStore.getState()
      if (!profile || !resume)
        return
      const trees: ResumeTree = { profile, resume }
      const useProfile = isInProfile(trees, id)
      const result = libPatch.update(useProfile ? profile : resume, id, key, after)
      if (!result)
        return
      useResumeStore.setState(writeBackTree(trees, useProfile, result.tree))
      useHistoryStore.getState().commit(result.patch)
    },

    add(parentId: string, payload: Node): void {
      const { profile, resume } = useResumeStore.getState()
      if (!profile || !resume)
        return
      const trees: ResumeTree = { profile, resume }
      const useProfile = isInProfile(trees, parentId)
      const result = libPatch.add(useProfile ? profile : resume, parentId, payload)
      useResumeStore.setState(writeBackTree(trees, useProfile, result.tree))
      useHistoryStore.getState().commit(result.patch)
    },

    remove(parentId: string, childId: string): void {
      const { profile, resume } = useResumeStore.getState()
      if (!profile || !resume)
        return
      const trees: ResumeTree = { profile, resume }
      const useProfile = isInProfile(trees, parentId)
      const result = libPatch.remove(useProfile ? profile : resume, parentId, childId)
      useResumeStore.setState(writeBackTree(trees, useProfile, result.tree))
      useHistoryStore.getState().commit(result.patch)
    },

    reorder(parentId: string, afterOrders: string[]): void {
      const { profile, resume } = useResumeStore.getState()
      if (!profile || !resume)
        return
      const trees: ResumeTree = { profile, resume }
      const useProfile = isInProfile(trees, parentId)
      const result = libPatch.reorder(useProfile ? profile : resume, parentId, afterOrders)
      if (!result)
        return
      useResumeStore.setState(writeBackTree(trees, useProfile, result.tree))
      useHistoryStore.getState().commit(result.patch)
    },
  }), [])

  return {
    patch,
    commit: actions.commit,
    undo: actions.undo,
    redo: actions.redo,
    canUndo,
    canRedo,
    reset: actions.reset,
    save: actions.save,
    registerSave: actions.registerSave,
    finishSave: actions.finishSave,
    isSaving,
  }
}
