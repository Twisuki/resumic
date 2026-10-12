import type { Node, Subtree, Tree } from "@shared/model/node"
import type { Patch } from "@shared/model/patch"
import type { Resume } from "@shared/model/resume"
import type { SavedResume, SaveFn, SaveReason } from "@/stores/history"
import { localServer } from "@/api/local/server"
import { SAVE_THRESHOLD } from "@/config/history"
import { stopAiRuns } from "@/lib/ai-runtime"
import {
  commit as commitFn,
  redo as redoFn,
  truncateAfterSave,
  undo as undoFn,
} from "@/lib/history"
import { applyPatch, inversePatch, patch as libPatch } from "@/lib/patch"
import { t } from "@/lib/toast"
import { deserialize, isSubtree, leafSubtree } from "@/lib/tree"
import { getTrialSnapshot, hasResumeWrites, isEditorReady, isModeReady, isTrialMode, setEditorLocked } from "@/lib/trial-mode"
import { useAiStore } from "@/stores/ai"
import { useAiPermissionStore } from "@/stores/ai-permission"
import { useHistoryStore } from "@/stores/history"
import { useResumeStore } from "@/stores/resume"

type RoutedTree = "profile" | "resume"

/**
 * @description 各输入框 / 编辑器注册的"未提交内容"刷新函数
 * 撤销 / 重做 / 手动保存前先 flush, 保证历史栈拿到最新文本
 */
const flushers = new Set<() => void>()

/**
 * @description 注册一个 flush, 返回注销函数
 */
export function registerFlush(fn: () => void): () => void {
  flushers.add(fn)
  return () => {
    flushers.delete(fn)
  }
}

function flushAll(): void {
  for (const fn of [...flushers])
    fn()
}

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

export type SaveResult
  = { status: "success", snapshot: SavedResume }
    | { status: "empty" | "busy" | "unavailable" }
    | { status: "failure", error: Error }

/** @description 释放严格保存边界, 切换已开始时不恢复本地写入 */
export function releaseSaveBoundary(): void {
  if (isModeReady())
    localServer.storage.resumeWrites()
  setEditorLocked(false)
}

function freezeEditor(): void {
  setEditorLocked(true)
  stopAiRuns()
  useAiPermissionStore.getState().reset()
  if (useAiStore.getState().status === "streaming")
    useAiStore.setState({ status: "idle" })
  if (isTrialMode())
    void localServer.storage.pauseWrites()
}

/** @description 返回本次提交的结果, 严格成功后保持冻结供关闭或登录继续使用 */
async function save(reason: SaveReason, strict = false): Promise<SaveResult> {
  if (!isEditorReady()) {
    if (strict)
      t.error("正在保存或切换模式，请稍候")
    return { status: "busy" }
  }
  if (strict && (useHistoryStore.getState().isSaving || hasResumeWrites())) {
    t.error("正在保存或处理简历，请稍候再试")
    return { status: "busy" }
  }
  if (reason === "manual") {
    try {
      flushAll()
    }
    catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause))
      t.error(`保存失败: ${error.message}`)
      return { status: "failure", error }
    }
  }

  const { isSaving, saveFn } = useHistoryStore.getState()
  if (isSaving || (strict && hasResumeWrites())) {
    if (reason === "manual")
      t.error("正在保存中, 请稍候")
    return { status: "busy" }
  }
  const { id, profile } = useResumeStore.getState()
  if (id === null) {
    if (strict)
      freezeEditor()
    return { status: "empty" }
  }
  if (!saveFn) {
    if (strict)
      t.error("保存尚未就绪，请稍候再试")
    return { status: "unavailable" }
  }

  const { generation } = getTrialSnapshot()
  useHistoryStore.getState().setSaving(true)
  try {
    const data = takeSnapshot()
    if (!data)
      throw new Error("没有可保存的简历")
    const snapshot = { id, data: structuredClone(data) }
    // 传输同步接纳本次请求后冻结, 保证写队列仍能完成这次保存
    const pending = saveFn(snapshot, reason)
    if (strict)
      freezeEditor()
    await pending
    if (!isModeReady() || generation !== getTrialSnapshot().generation)
      throw new DOMException("模式已切换", "AbortError")
    if (reason === "auto" && profile?.rootId === useResumeStore.getState().profile?.rootId) {
      const { history, setHistory } = useHistoryStore.getState()
      setHistory(truncateAfterSave(history))
    }
    return { status: "success", snapshot }
  }
  catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause))
    const label = reason === "auto" ? "自动保存" : "保存"
    t.error(`${label}失败: ${error.message}`)
    if (strict)
      releaseSaveBoundary()
    return { status: "failure", error }
  }
  finally {
    useHistoryStore.getState().setSaving(false)
  }
}

/**
 * @description 推入 history, 达阈值触发自动保存
 */
function commit(p: Patch): void {
  if (!isEditorReady())
    return
  const { history, setHistory } = useHistoryStore.getState()
  setHistory(commitFn(history, p))

  if (useHistoryStore.getState().history.past.length >= SAVE_THRESHOLD)
    void save("auto")
}

/**
 * @description 撤销最近一条: 应用 inverse 到树 + 移到 future
 */
function undo(): void {
  if (!isEditorReady())
    return
  flushAll()
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
  if (!isEditorReady())
    return
  flushAll()
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
  if (isModeReady())
    useHistoryStore.getState().setSaveFn(saveFn)
}

/**
 * @description 手动保存, 返回 Promise 让调用方能等到保存完成 (错误已 toast, 不会 reject)
 */
async function saveManual(): Promise<void> {
  await save("manual")
}

/**
 * @description 简历编辑命令: 写树 + 提交 history; 也作为顶层 export, 供非 React 上下文 (AI 工具) 调用
 */
export const patch = {
  update(id: string, key: string, after: unknown): void {
    if (!isEditorReady())
      return
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
    if (!isEditorReady())
      return
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
    if (!isEditorReady())
      return null
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
    if (!isEditorReady())
      return
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
    saveStrict: () => save("manual", true),
    registerSave,
    isSaving,
  }
}
