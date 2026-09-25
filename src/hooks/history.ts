import type { Node, Subtree, Tree } from "@shared/model/node"
import type { Patch } from "@shared/model/patch"
import type { Resume } from "@shared/model/resume"
import type { SaveFn, SaveReason } from "@/stores/history"
import { toast } from "sonner"
import { SAVE_THRESHOLD } from "@/config/history"
import {
  commit as commitFn,
  redo as redoFn,
  truncateAfterSave,
  undo as undoFn,
} from "@/lib/history"
import { applyPatch, inversePatch, patch as libPatch } from "@/lib/patch"
import { deserialize, isSubtree, leafSubtree } from "@/lib/tree"
import { useHistoryStore } from "@/stores/history"
import { useResumeStore } from "@/stores/resume"

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

/**
 * @description 把新树写回对应的完整简历树
 */
function writeBack(which: RoutedTree, tree: Tree): void {
  useResumeStore.setState(which === "profile" ? { profile: tree } : { resume: tree })
}

/**
 * @description 取当前文档快照
 */
function takeSnapshot(): Resume | null {
  const { profile, resume } = useResumeStore.getState()
  if (!profile || !resume)
    return null
  return deserialize({ profile, resume })
}

/**
 * @description 统一保存流程: 取快照 -> 调传输 -> 自动保存成功则截断历史
 */
async function save(reason: SaveReason): Promise<void> {
  const { isSaving, saveFn } = useHistoryStore.getState()
  if (!saveFn)
    return
  if (isSaving) {
    if (reason === "manual")
      toast.error("正在保存中, 请稍候")
    return
  }

  useHistoryStore.getState().setSaving(true)
  try {
    const snapshot = takeSnapshot()
    if (!snapshot)
      return
    await saveFn(snapshot, reason)
    if (reason === "auto") {
      const { history, setHistory } = useHistoryStore.getState()
      setHistory(truncateAfterSave(history))
    }
  }
  catch (error) {
    const label = reason === "auto" ? "自动保存" : "保存"
    toast.error(`${label}失败: ${(error as Error).message}`)
  }
  finally {
    useHistoryStore.getState().setSaving(false)
  }
}

/**
 * @description 推入 history, 达阈值触发自动保存
 */
function commit(p: Patch): void {
  const { history, setHistory } = useHistoryStore.getState()
  setHistory(commitFn(history, p))

  if (useHistoryStore.getState().history.past.length >= SAVE_THRESHOLD)
    void save("auto")
}

/**
 * @description 撤销最近一条: 应用 inverse 到树 + 移到 future
 */
function undo(): void {
  const result = undoFn(useHistoryStore.getState().history)
  if (!result)
    return

  const { profile, resume } = useResumeStore.getState()
  if (!profile || !resume)
    return

  const { which, tree } = computeHistoryPatch(profile, resume, inversePatch(result.patch))
  writeBack(which, tree)
  useHistoryStore.getState().setHistory(result.history)
}

/**
 * @description 重做最近一条: 应用 forward 到树 + 推回 past
 */
function redo(): void {
  const result = redoFn(useHistoryStore.getState().history)
  if (!result)
    return

  const { profile, resume } = useResumeStore.getState()
  if (!profile || !resume)
    return

  const { which, tree } = computeHistoryPatch(profile, resume, result.patch)
  writeBack(which, tree)
  useHistoryStore.getState().setHistory(result.history)
}

/**
 * @description 清空 history 栈与 isSaving
 */
function reset(): void {
  useHistoryStore.getState().reset()
}

/**
 * @description 注册保存传输函数
 */
function registerSave(saveFn: SaveFn): void {
  useHistoryStore.getState().setSaveFn(saveFn)
}

/**
 * @description 手动保存
 */
function saveManual(): void {
  void save("manual")
}

/**
 * @description 简历编辑命令: 写树 + 提交 history
 */
const patch = {
  update(id: string, key: string, after: unknown): void {
    const { profile, resume } = useResumeStore.getState()
    if (!profile || !resume)
      return
    const useProfile = profile.nodes.has(id)
    const result = libPatch.update(useProfile ? profile : resume, id, key, after)
    if (!result)
      return
    writeBack(useProfile ? "profile" : "resume", result.tree)
    commit(result.patch)
  },

  add(parentId: string, payload: Node | Subtree): void {
    const { profile, resume } = useResumeStore.getState()
    if (!profile || !resume)
      return
    const useProfile = profile.nodes.has(parentId)
    const subtree = isSubtree(payload) ? payload : leafSubtree(payload)
    const result = libPatch.add(useProfile ? profile : resume, parentId, subtree)
    writeBack(useProfile ? "profile" : "resume", result.tree)
    commit(result.patch)
  },

  remove(parentId: string, childId: string): Subtree | null {
    const { profile, resume } = useResumeStore.getState()
    if (!profile || !resume)
      return null
    const useProfile = profile.nodes.has(parentId)
    const result = libPatch.remove(useProfile ? profile : resume, parentId, childId)
    writeBack(useProfile ? "profile" : "resume", result.tree)
    commit(result.patch)
    return result.patch.payload
  },

  reorder(parentId: string, afterOrders: string[]): void {
    const { profile, resume } = useResumeStore.getState()
    if (!profile || !resume)
      return
    const useProfile = profile.nodes.has(parentId)
    const result = libPatch.reorder(useProfile ? profile : resume, parentId, afterOrders)
    if (!result)
      return
    writeBack(useProfile ? "profile" : "resume", result.tree)
    commit(result.patch)
  },
}

/**
 * @description 历史 hook: 编辑命令 + 撤销重做 + 保存编排
 */
export function useHistory() {
  const isSaving = useHistoryStore(s => s.isSaving)
  const canUndo = useHistoryStore(s => s.history.past.length > 0)
  const canRedo = useHistoryStore(s => s.history.future.length > 0)

  return {
    patch,
    commit,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    save: saveManual,
    registerSave,
    isSaving,
  }
}
