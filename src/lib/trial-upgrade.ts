import { ErrorCode } from "@shared/error-code"
import { z } from "zod"
import { ApiClientError } from "@/lib/request"

export const TRIAL_UPGRADE_KEY = "resumic.trial.upgrade"
export const TRIAL_UPGRADE_PARAM = "trial-upgrade"

const intentSchema = z.object({
  version: z.literal(1),
  nonce: z.string().min(1),
  sourceResumeId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).nullable(),
  sourceUpdatedAt: z.iso.datetime({ offset: true }).nullable(),
  phase: z.enum(["awaiting-login", "ready"]),
  userId: z.number().int().positive().nullable(),
  uploadedAvatar: z.object({ id: z.number().int().positive(), url: z.string().min(1) }).nullable(),
}).strict().refine(intent => intent.phase !== "ready" || intent.userId !== null).refine(intent => (intent.sourceResumeId === null) === (intent.sourceUpdatedAt === null))

export type TrialUpgradeIntent = z.infer<typeof intentSchema>

/** @description 同窗口升级意图仅保存来源标识, 不含正文或凭据 */
export function readUpgradeIntent(): TrialUpgradeIntent | null {
  let raw: string | null
  try {
    raw = window.sessionStorage.getItem(TRIAL_UPGRADE_KEY)
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "无法读取本地登录待办，请检查浏览器存储权限")
  }
  if (raw === null)
    return null
  try {
    return intentSchema.parse(JSON.parse(raw))
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "本地登录待办损坏或版本不受支持")
  }
}

export function writeUpgradeIntent(intent: TrialUpgradeIntent): void {
  const parsed = intentSchema.safeParse(intent)
  if (!parsed.success)
    throw new ApiClientError(ErrorCode.Validation.InvalidParams, "本地登录待办无效")
  try {
    window.sessionStorage.setItem(TRIAL_UPGRADE_KEY, JSON.stringify(parsed.data))
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "无法保存本地登录待办，请检查浏览器存储权限")
  }
}

export function clearUpgradeIntent(): void {
  try {
    window.sessionStorage.removeItem(TRIAL_UPGRADE_KEY)
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "无法清空本地登录待办，请检查浏览器存储权限")
  }
}

export function consumeUpgradeReturn(nonce: string): void {
  const url = new URL(window.location.href)
  if (url.searchParams.get(TRIAL_UPGRADE_PARAM) !== nonce)
    return
  url.searchParams.delete(TRIAL_UPGRADE_PARAM)
  window.history.replaceState(window.history.state, "", url.href)
}

/** @description 返回参数必须匹配同窗口尚在等待登录的意图 */
export function getUpgradeReturn(): TrialUpgradeIntent | null {
  const nonce = new URL(window.location.href).searchParams.get(TRIAL_UPGRADE_PARAM)
  if (!nonce)
    return null
  const intent = readUpgradeIntent()
  return intent?.phase === "awaiting-login" && intent.nonce === nonce ? intent : null
}
