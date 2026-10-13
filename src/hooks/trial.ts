import type { CreateResumeResponse } from "@shared/model"
import type { SavedResume } from "@/stores/history"
import { resumeSchema } from "@shared/schema/resume"
import { useEffect, useRef, useState } from "react"
import { api } from "@/api"
import { localServer } from "@/api/local/server"
import { DEFAULT_RESUME } from "@/config/resume"
import { releaseSaveBoundary } from "@/hooks/history"
import { useResumeSnapshot } from "@/hooks/resume-snapshot"
import { genId } from "@/lib/id"
import { t } from "@/lib/toast"
import { clearTrial, disableTrial, enableTrial, isTrialMode, useTrialMode } from "@/lib/trial-mode"
import { TRIAL_UPGRADE_PARAM, writeUpgradeIntent } from "@/lib/trial-upgrade"
import { useResumeStore } from "@/stores/resume"

let actionPending = false

/** @description 主编辑页首次挂载恢复已有简历, 空存储不自动补建 */
export function useTrialRestore() {
  const { enabled } = useTrialMode()
  const requestRef = useRef<Promise<CreateResumeResponse | null> | null>(null)
  const [state, setState] = useState<{ ready: boolean, error: Error | null }>({ ready: !enabled, error: null })

  useEffect(() => {
    if (!enabled)
      return
    let disposed = false
    requestRef.current ??= api.resume.list().then(async (list) => {
      const item = list[0]
      return item ? { id: item.id, data: await api.resume.get(item.id) } : null
    })
    void requestRef.current.then((resume) => {
      if (disposed || !isTrialMode())
        return
      if (resume)
        useResumeStore.getState().open(resume.id, resume.data)
      setState({ ready: true, error: null })
    }, (cause: unknown) => {
      if (!disposed)
        setState({ ready: false, error: cause instanceof Error ? cause : new Error(String(cause)) })
    })
    return () => {
      disposed = true
    }
  }, [enabled])

  return state
}

/** @description 统一试用动作, 保存失败或忙碌时保留编辑器并阻止后续操作 */
export function useTrialActions() {
  const { saveStrictAndSnapshot: saveStrict } = useResumeSnapshot()

  async function perform(action: (snapshot: SavedResume | null) => Promise<void>, saveFirst = true, hold = false): Promise<boolean> {
    if (actionPending) {
      t.error("正在处理试用操作，请稍候")
      return false
    }
    actionPending = true
    let succeeded = false
    let ownsBoundary = false
    try {
      let snapshot: SavedResume | null = null
      if (saveFirst) {
        const result = await saveStrict()
        if (result.status !== "success" && result.status !== "empty")
          return false
        ownsBoundary = true
        if (result.status === "success")
          snapshot = result.snapshot
      }
      await action(snapshot)
      succeeded = true
      return true
    }
    catch (error) {
      t.error(error instanceof Error ? error.message : String(error))
      return false
    }
    finally {
      if (ownsBoundary && (!hold || !succeeded))
        releaseSaveBoundary()
      actionPending = false
    }
  }

  function enter(): Promise<boolean> {
    return perform(() => enableTrial(async () => {
      const state = await localServer.storage.read()
      if (!state.resume)
        await localServer.resume.create(DEFAULT_RESUME)
    }))
  }

  function close(): Promise<boolean> {
    return perform(disableTrial)
  }

  function clear(): Promise<boolean> {
    return perform(clearTrial, false)
  }

  async function prepareLogin(): Promise<string | null> {
    if (!isTrialMode())
      return window.location.pathname + window.location.search
    let next: string | null = null
    const prepared = await perform(async (snapshot) => {
      const { resume } = await localServer.storage.read()
      if (snapshot && (resume?.id !== snapshot.id || JSON.stringify(resume.data) !== JSON.stringify(resumeSchema.parse(snapshot.data))))
        throw new Error("本地简历已被其他窗口修改，请重新打开后再登录")
      const nonce = genId()
      writeUpgradeIntent({
        version: 1,
        nonce,
        sourceResumeId: resume?.id ?? null,
        sourceUpdatedAt: resume?.updatedAt ?? null,
        phase: "awaiting-login",
        userId: null,
        uploadedAvatar: null,
      })
      const url = new URL(window.location.href)
      url.searchParams.set(TRIAL_UPGRADE_PARAM, nonce)
      next = url.pathname + url.search
    }, true, true)
    return prepared ? next : null
  }

  return { enter, close, clear, prepareLogin }
}
