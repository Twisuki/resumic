"use client"

import type { ReactNode } from "react"
import type { TrialAction } from "@/lib/trial-mode"
import { ErrorCode } from "@shared/error-code"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { auth } from "@/api/auth"
import { LOCAL_STATE_KEY, localServer } from "@/api/local/server"
import { keys } from "@/hooks/query/key"
import { stopAiRuns } from "@/lib/ai-runtime"
import { ApiClientError } from "@/lib/request"
import { t } from "@/lib/toast"
import {
  flushModeOperations,
  getTrialSnapshot,
  isModeReady,
  readTrialEnabled,
  registerTrialTransition,
  setTrialStatus,
  TRIAL_MODE_KEY,
  useTrialMode,
  writeTrialEnabled,
} from "@/lib/trial-mode"
import { clearUpgradeIntent, consumeUpgradeReturn, getUpgradeReturn, writeUpgradeIntent } from "@/lib/trial-upgrade"
import { useAiStore } from "@/stores/ai"
import { useAiPermissionStore } from "@/stores/ai-permission"
import { useHistoryStore } from "@/stores/history"
import { useResumeStore } from "@/stores/resume"

function waitForSave(): Promise<void> {
  if (!useHistoryStore.getState().isSaving)
    return Promise.resolve()
  return new Promise((resolve) => {
    const unsubscribe = useHistoryStore.subscribe((state) => {
      if (!state.isSaving) {
        unsubscribe()
        resolve()
      }
    })
  })
}

function resetSession(): void {
  useResumeStore.getState().close()
  useHistoryStore.getState().setSaveFn(null)
  useAiStore.setState({ messages: [], status: "idle", error: null })
}

/** @description 模式恢复完成前阻止业务 hooks 挂载, 主页面与打印页共用 */
export default function TrialProvider({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const mode = useTrialMode()
  const queryClient = useQueryClient()

  useEffect(() => {
    let disposed = false
    const controller = new AbortController()

    async function initialize(): Promise<void> {
      try {
        setTrialStatus("boot")
        const enabled = readTrialEnabled()
        const intent = getUpgradeReturn()
        queryClient.clear()
        if (intent) {
          setTrialStatus("upgrade-return")
          const params = new URL(window.location.href).searchParams
          if (params.get("login") !== "failed") {
            try {
              const user = await auth.me({ signal: controller.signal })
              if (disposed || controller.signal.aborted)
                return
              writeTrialEnabled(false)
              writeUpgradeIntent({ ...intent, phase: "ready", userId: user.id })
              consumeUpgradeReturn(intent.nonce)
              queryClient.setQueryData(keys.auth.me, user)
              localServer.storage.resumeWrites()
              setTrialStatus("remote", null, user)
              return
            }
            catch (error) {
              if (disposed || controller.signal.aborted)
                return
              t.error(error instanceof Error ? error.message : "登录验证失败")
            }
          }
          writeTrialEnabled(true)
          await localServer.storage.read()
          if (disposed || controller.signal.aborted)
            return
          consumeUpgradeReturn(intent.nonce)
          localServer.storage.resumeWrites()
          setTrialStatus("trial")
          return
        }
        if (enabled)
          await localServer.storage.read()
        if (disposed || controller.signal.aborted)
          return
        localServer.storage.resumeWrites()
        setTrialStatus(enabled ? "trial" : "remote")
      }
      catch (error) {
        if (!disposed && !controller.signal.aborted)
          setTrialStatus("error", error instanceof Error ? error : new Error("模式初始化失败"))
      }
    }

    async function transition(action: TrialAction): Promise<void> {
      const { status } = getTrialSnapshot()
      if (status === "switching" || (!isModeReady() && action.type !== "sync" && action.type !== "clear"))
        throw new ApiClientError(ErrorCode.System.Internal, "请等待模式初始化或切换完成")
      controller.abort()
      setTrialStatus("switching")
      stopAiRuns()
      useAiPermissionStore.getState().reset()
      try {
        await Promise.all([
          localServer.storage.pauseWrites(),
          queryClient.cancelQueries(),
          flushModeOperations(),
          waitForSave(),
        ])
        if (disposed)
          return
        resetSession()
        queryClient.clear()
        if (action.type === "enable") {
          if (action.prepare) {
            localServer.storage.resumeWrites()
            try {
              await action.prepare()
            }
            finally {
              await localServer.storage.pauseWrites()
            }
          }
          writeTrialEnabled(true)
        }
        else if (action.type === "disable" || action.type === "clear") {
          clearUpgradeIntent()
          if (action.type === "clear")
            await localServer.storage.clear()
          writeTrialEnabled(false)
        }
        window.location.reload()
      }
      catch (error) {
        if (!disposed)
          setTrialStatus("error", error instanceof Error ? error : new Error("模式切换失败"))
        throw error
      }
    }

    function onStorage(event: StorageEvent): void {
      if (event.storageArea !== window.localStorage)
        return
      if (event.key === TRIAL_MODE_KEY || event.key === null) {
        const status = getTrialSnapshot().status
        const enabled = event.key === null ? false : event.newValue === "1"
        if ((enabled && status !== "trial") || (!enabled && status !== "remote")) {
          void transition({ type: "sync" }).catch((error: unknown) => {
            t.error(error instanceof Error ? error.message : "模式同步失败")
          })
          return
        }
      }
      if ((event.key === LOCAL_STATE_KEY || event.key === null) && getTrialSnapshot().status === "trial") {
        try {
          localServer.ai.syncCredentials()
        }
        catch (error) {
          t.error(error instanceof Error ? error.message : "本地数据同步失败")
        }
        void queryClient.invalidateQueries({ queryKey: keys.resume.lists() })
        void queryClient.invalidateQueries({ queryKey: keys.ai.configs.list() })
      }
    }

    const unregister = registerTrialTransition(transition)
    const unsubscribeKeys = localServer.credentials.subscribe(() => {
      void queryClient.invalidateQueries({ queryKey: keys.ai.configs.list() })
    })
    window.addEventListener("storage", onStorage)
    void initialize()
    return () => {
      disposed = true
      controller.abort()
      unregister()
      unsubscribeKeys()
      window.removeEventListener("storage", onStorage)
    }
  }, [queryClient])

  if (mode.status === "error") {
    return (
      <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-sm">
        <p>{mode.error?.message ?? "模式初始化失败"}</p>
        <button type="button" className="underline" onClick={() => window.location.reload()}>重新加载</button>
      </div>
    )
  }
  if (!mode.ready)
    return null
  return children
}
