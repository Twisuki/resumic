"use client"

import type { AvatarSlotResponse, Resume } from "@shared/model"
import type { TrialUpgradeIntent } from "@/lib/trial-upgrade"
import { ErrorCode } from "@shared/error-code"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { localServer } from "@/api/local/server"
import { remoteApi } from "@/api/migration"
import { keys } from "@/hooks/query/key"
import { ApiClientError } from "@/lib/request"
import {
  clearUpgradeIntent,
  readUpgradeIntent,

  writeUpgradeIntent,
} from "@/lib/trial-upgrade"
import { useResumeStore } from "@/stores/resume"

export type MigrationPhase
  = | "loading"
    | "awaiting-avatar-choice"
    | "uploading-avatar"
    | "creating-resume"
    | "completed"
    | "failed"
    | "result-unknown"
    | "source-conflict"

export interface MigrationState {
  open: boolean
  phase: MigrationPhase
  error: Error | null
  slots: AvatarSlotResponse[]
  source: Resume | null
  uploadedAvatar: { id: number, url: string } | null
}

const INITIAL: MigrationState = {
  open: false,
  phase: "loading",
  error: null,
  slots: [],
  source: null,
  uploadedAvatar: null,
}

/** @description 从 data URL 解 mime / base64 并构造同名 File, 给头像槽位上传用 */
function dataUrlToFile(dataUrl: string, name = "avatar"): File {
  const comma = dataUrl.indexOf(",")
  if (comma < 0)
    throw new ApiClientError(ErrorCode.Validation.InvalidParams, "本地头像格式不合法")
  const header = dataUrl.slice(0, comma)
  const base64 = dataUrl.slice(comma + 1)
  const mime = /^data:([^;]+);base64$/i.exec(header)?.[1] ?? "image/webp"
  const ext = mime.split("/")[1] ?? "webp"
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i)
  return new File([bytes], `${name}.${ext}`, { type: mime })
}

/** @description 把数据 URL 头像就地替换成上传后的远端 URL, 返回深克隆 resume */
function substituteAvatar(source: Resume, url: string): Resume {
  return { ...source, avatar: url }
}

/** @description 检查本地快照是否仍与当时保存登录待办时的版本一致 */
function checkSource(intent: TrialUpgradeIntent, current: { id: number, updatedAt: string } | null): "ok" | "deleted" | "modified" {
  if (!intent.sourceResumeId || !intent.sourceUpdatedAt)
    return "ok"
  if (!current)
    return "deleted"
  if (current.id !== intent.sourceResumeId)
    return "deleted"
  if (current.updatedAt !== intent.sourceUpdatedAt)
    return "modified"
  return "ok"
}

export interface UseTrialUpgrade {
  state: MigrationState
  refreshSlots: () => Promise<void>
  uploadNewAvatar: () => Promise<void>
  replaceAvatar: (slotId: number) => Promise<void>
  retry: () => Promise<void>
  cancel: () => void
}

/** @description 试用登录迁移的状态机: 监听 intent.phase=ready 自动打开弹窗, 协调头像上传与简历创建 */
export function useTrialUpgrade(): UseTrialUpgrade {
  const queryClient = useQueryClient()
  const intentRef = useRef<TrialUpgradeIntent | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const [state, setState] = useState<MigrationState>(INITIAL)
  const stateRef = useRef(state)
  stateRef.current = state

  function abortOngoing(): void {
    controllerRef.current?.abort()
    controllerRef.current = null
  }

  const createResume = useCallback(async (intent: TrialUpgradeIntent, source: Resume, avatarUrl: string | null) => {
    const controller = new AbortController()
    controllerRef.current?.abort()
    controllerRef.current = controller
    setState(prev => ({ ...prev, phase: "creating-resume", error: null }))
    try {
      const data = avatarUrl ? substituteAvatar(source, avatarUrl) : source
      const result = await remoteApi.resume.create(data, { signal: controller.signal })
      if (controller.signal.aborted) {
        setState(prev => ({ ...prev, phase: "result-unknown" }))
        return
      }
      useResumeStore.getState().open(result.id, result.data)
      await queryClient.invalidateQueries({ queryKey: keys.resume.lists() })
      await queryClient.invalidateQueries({ queryKey: keys.avatar.lists() })
      intentRef.current = null
      clearUpgradeIntent()
      setState(prev => ({ ...prev, phase: "completed", error: null }))
    }
    catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setState(prev => ({ ...prev, phase: "result-unknown" }))
        return
      }
      const err = error instanceof Error ? error : new Error(String(error))
      if (controller.signal.aborted) {
        setState(prev => ({ ...prev, phase: "result-unknown", error: err }))
        return
      }
      setState(prev => ({ ...prev, phase: "failed", error: err }))
    }
  }, [queryClient])

  const uploadAvatar = useCallback(async (intent: TrialUpgradeIntent, source: Resume, mode: "create" | "replace", slotId: number | null) => {
    const avatar = source.avatar
    if (typeof avatar !== "string" || !avatar.startsWith("data:"))
      return null
    const controller = new AbortController()
    controllerRef.current?.abort()
    controllerRef.current = controller
    setState(prev => ({ ...prev, phase: "uploading-avatar", error: null }))
    try {
      const file = dataUrlToFile(avatar)
      const form = new FormData()
      form.append("file", file)
      const result = mode === "create"
        ? await remoteApi.avatar.create(form, { signal: controller.signal })
        : await remoteApi.avatar.replace(slotId!, form, { signal: controller.signal })
      if (controller.signal.aborted) {
        setState(prev => ({ ...prev, phase: "result-unknown" }))
        return null
      }
      const uploaded = { id: result.id, url: result.url }
      const next: TrialUpgradeIntent = { ...intent, uploadedAvatar: uploaded }
      writeUpgradeIntent(next)
      intentRef.current = next
      setState(prev => ({ ...prev, uploadedAvatar: uploaded }))
      return uploaded
    }
    catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setState(prev => ({ ...prev, phase: "result-unknown" }))
        return null
      }
      const err = error instanceof Error ? error : new Error(String(error))
      if (error instanceof ApiClientError && error.code === ErrorCode.Avatar.TooMany) {
        try {
          const slots = await remoteApi.avatar.list()
          if (controller.signal.aborted)
            return null
          setState(prev => ({ ...prev, phase: "awaiting-avatar-choice", slots, error: null }))
        }
        catch {
          setState(prev => ({ ...prev, phase: "failed", error: err }))
        }
        return null
      }
      if (controller.signal.aborted) {
        setState(prev => ({ ...prev, phase: "result-unknown", error: err }))
        return null
      }
      setState(prev => ({ ...prev, phase: "failed", error: err }))
      return null
    }
  }, [])

  const loadSlots = useCallback(async () => {
    const controller = new AbortController()
    controllerRef.current?.abort()
    controllerRef.current = controller
    try {
      const slots = await remoteApi.avatar.list({ signal: controller.signal })
      if (controller.signal.aborted)
        return
      setState(prev => ({ ...prev, slots, phase: "awaiting-avatar-choice", error: null }))
    }
    catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        return
      const err = error instanceof Error ? error : new Error(String(error))
      if (controller.signal.aborted) {
        setState(prev => ({ ...prev, phase: "result-unknown", error: err }))
        return
      }
      setState(prev => ({ ...prev, phase: "failed", error: err }))
    }
  }, [])

  const beginMigration = useCallback(async (intent: TrialUpgradeIntent) => {
    abortOngoing()
    setState({ ...INITIAL, open: true, phase: "loading" })
    let current: { id: number, updatedAt: string } | null = null
    try {
      const stored = await localServer.storage.read()
      if (stored.resume)
        current = { id: stored.resume.id, updatedAt: stored.resume.updatedAt }
    }
    catch (error) {
      setState(prev => ({ ...prev, phase: "failed", error: error instanceof Error ? error : new Error(String(error)) }))
      return
    }
    const status = checkSource(intent, current)
    if (status !== "ok") {
      setState(prev => ({ ...prev, phase: "source-conflict" }))
      return
    }
    if (!current || !intent.sourceResumeId) {
      setState(prev => ({ ...prev, phase: "source-conflict" }))
      return
    }
    let source: Resume
    try {
      source = await localServer.resume.get(current.id)
    }
    catch (error) {
      setState(prev => ({ ...prev, phase: "failed", error: error instanceof Error ? error : new Error(String(error)) }))
      return
    }
    intentRef.current = intent
    setState(prev => ({ ...prev, source }))

    if (intent.uploadedAvatar) {
      setState(prev => ({ ...prev, uploadedAvatar: intent.uploadedAvatar }))
      await createResume(intent, source, intent.uploadedAvatar.url)
      return
    }
    const avatar = source.avatar
    if (typeof avatar !== "string" || !avatar.startsWith("data:")) {
      await createResume(intent, source, null)
      return
    }
    await loadSlots()
  }, [createResume, loadSlots])

  const [pendingIntent] = useState(() => {
    const intent = readUpgradeIntent()
    return intent?.phase === "ready" && intent.sourceResumeId ? intent : null
  })

  useEffect(() => {
    if (pendingIntent)
      void beginMigration(pendingIntent)
  }, [pendingIntent, beginMigration])

  const uploadNewAvatar = useCallback(async () => {
    const intent = intentRef.current
    const source = stateRef.current.source
    if (!intent || !source)
      return
    const uploaded = await uploadAvatar(intent, source, "create", null)
    if (uploaded)
      await createResume(intent, source, uploaded.url)
  }, [createResume, uploadAvatar])

  const replaceAvatar = useCallback(async (slotId: number) => {
    const intent = intentRef.current
    const source = stateRef.current.source
    if (!intent || !source)
      return
    const uploaded = await uploadAvatar(intent, source, "replace", slotId)
    if (uploaded)
      await createResume(intent, source, uploaded.url)
  }, [createResume, uploadAvatar])

  const retry = useCallback(async () => {
    const intent = intentRef.current ?? readUpgradeIntent()
    if (!intent || intent.phase !== "ready" || !intent.sourceResumeId)
      return
    intentRef.current = intent
    const cur = stateRef.current
    if (cur.phase === "source-conflict") {
      void beginMigration(intent)
      return
    }
    if (cur.uploadedAvatar && cur.source) {
      await createResume(intent, cur.source, cur.uploadedAvatar.url)
      return
    }
    if (cur.source)
      await loadSlots()
  }, [beginMigration, createResume, loadSlots])

  const cancel = useCallback(() => {
    const busy = stateRef.current.phase === "uploading-avatar" || stateRef.current.phase === "creating-resume"
    if (busy) {
      abortOngoing()
      setState(prev => ({ ...prev, phase: "result-unknown", error: new Error("已取消") }))
      return
    }
    intentRef.current = null
    clearUpgradeIntent()
    setState(INITIAL)
  }, [])

  return { state, refreshSlots: loadSlots, uploadNewAvatar, replaceAvatar, retry, cancel }
}
