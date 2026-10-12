import type { MeResponse } from "@shared/model"
import { ErrorCode } from "@shared/error-code"
import { useSyncExternalStore } from "react"
import { ApiClientError } from "@/lib/request"

export const TRIAL_MODE_KEY = "resumic.trial.enabled"
export type TrialStatus = "boot" | "trial" | "remote" | "upgrade-return" | "switching" | "error"
export type TrialAction = { type: "enable", prepare?: () => Promise<void> } | { type: "disable" | "clear" | "sync" }

export interface TrialSnapshot {
  status: TrialStatus
  generation: number
  error: Error | null
  user: MeResponse | null
}

const serverSnapshot: TrialSnapshot = { status: "boot", generation: 0, error: null, user: null }
let snapshot = serverSnapshot
const listeners = new Set<() => void>()
const operations = new Set<Promise<unknown>>()
let transition: ((action: TrialAction) => Promise<void>) | undefined

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getTrialSnapshot(): TrialSnapshot {
  return snapshot
}

export function isModeReady(): boolean {
  return snapshot.status === "trial" || snapshot.status === "remote"
}

export function isTrialMode(): boolean {
  return snapshot.status === "trial"
}

/** @description 发布模式快照并使上一代异步操作失效 */
export function setTrialStatus(status: TrialStatus, error: Error | null = null, user: MeResponse | null = null): void {
  snapshot = { status, generation: snapshot.generation + 1, error, user }
  for (const listener of listeners)
    listener()
}

/** @description SSR 固定为 boot, 水合后订阅浏览器模式 */
export function useTrialMode() {
  const state = useSyncExternalStore(subscribe, getTrialSnapshot, () => serverSnapshot)
  return { ...state, enabled: state.status === "trial", ready: state.status === "trial" || state.status === "remote" }
}

/** @description 只在客户端初始化时读取模式标记 */
export function readTrialEnabled(): boolean {
  try {
    return window.localStorage.getItem(TRIAL_MODE_KEY) === "1"
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "无法读取本地试用标记，请检查浏览器存储权限")
  }
}

export function writeTrialEnabled(enabled: boolean): void {
  try {
    if (enabled)
      window.localStorage.setItem(TRIAL_MODE_KEY, "1")
    else
      window.localStorage.removeItem(TRIAL_MODE_KEY)
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "无法更新本地试用标记，请检查浏览器存储权限")
  }
}

/** @description 固定调用所属模式, 切换后拒绝迟到结果 */
export async function runInMode<T>(operation: (mode: "trial" | "remote") => Promise<T>): Promise<T> {
  if (!isModeReady())
    throw new ApiClientError(ErrorCode.System.Internal, "模式尚未就绪，请等待初始化或切换完成")
  const { generation } = snapshot
  const pending = operation(isTrialMode() ? "trial" : "remote").then((result) => {
    if (!isModeReady() || snapshot.generation !== generation)
      throw new DOMException("模式已切换", "AbortError")
    return result
  })
  operations.add(pending)
  void pending.then(() => operations.delete(pending), () => operations.delete(pending))
  return pending
}

export async function flushModeOperations(): Promise<void> {
  await Promise.allSettled([...operations])
}

export function registerTrialTransition(handler: (action: TrialAction) => Promise<void>): () => void {
  transition = handler
  return () => {
    if (transition === handler)
      transition = undefined
  }
}

function requestTransition(action: TrialAction): Promise<void> {
  if (!transition)
    return Promise.reject(new ApiClientError(ErrorCode.System.Internal, "模式初始化尚未完成"))
  return transition(action)
}

/** @description 旧操作排空后准备本地数据, 成功才启用并重载 */
export function enableTrial(prepare?: () => Promise<void>): Promise<void> {
  return requestTransition({ type: "enable", prepare })
}

export function disableTrial(): Promise<void> {
  return requestTransition({ type: "disable" })
}

export function clearTrial(): Promise<void> {
  return requestTransition({ type: "clear" })
}
