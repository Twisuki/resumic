import type { LocalState } from "@/api/local/model"
import type { RequestOptions } from "@/lib/request"
import { ErrorCode } from "@shared/error-code"
import { credentials } from "@/api/local/credentials"
import { emptyState, localStateSchema } from "@/api/local/model"
import { ApiClientError } from "@/lib/request"

export const LOCAL_STATE_KEY = "resumic.local.state"

let writeQueue: Promise<void> = Promise.resolve()
let writesPaused = false
let clearTask: Promise<void> | null = null

function getStorage(): Storage {
  if (typeof window === "undefined") {
    throw new ApiClientError(ErrorCode.System.Internal, "本地存储仅可在浏览器中使用")
  }
  try {
    return window.localStorage
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "无法访问本地存储，请检查浏览器存储权限")
  }
}

function validateState(value: unknown): LocalState {
  const parsed = localStateSchema.safeParse(value)
  if (!parsed.success) {
    throw new ApiClientError(ErrorCode.System.Internal, "本地数据损坏或版本不受支持")
  }
  return parsed.data
}

/** @description 读取并校验最新持久化快照 */
export function readState(): LocalState {
  const localStorage = getStorage()
  let raw: string | null
  try {
    raw = localStorage.getItem(LOCAL_STATE_KEY)
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "无法读取本地数据，请检查浏览器存储权限")
  }
  if (raw === null)
    return emptyState()

  let value: unknown
  try {
    value = JSON.parse(raw)
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "本地数据损坏或版本不受支持")
  }
  return validateState(value)
}

function writeState(state: LocalState): void {
  const validated = validateState(state)
  const localStorage = getStorage()
  try {
    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(validated))
  }
  catch {
    throw new ApiClientError(ErrorCode.System.Internal, "本地保存失败，请检查浏览器存储权限或可用空间")
  }
}

export function assertNotAborted(options?: RequestOptions): void {
  options?.signal?.throwIfAborted()
}

/** @description 排队提交完整快照, 成功后执行内存副作用 */
export function enqueueWrite<T>(operation: (state: LocalState) => T, options?: RequestOptions, afterCommit?: () => void): Promise<T> {
  assertNotAborted(options)
  if (writesPaused) {
    throw new ApiClientError(ErrorCode.System.Internal, "本地写入已暂停，请等待模式切换完成")
  }
  const task = writeQueue.then(() => {
    assertNotAborted(options)
    const state = readState()
    const result = operation(state)
    writeState(state)
    afterCommit?.()
    return result
  })
  writeQueue = task.then(() => undefined, () => undefined)
  return task
}

export const storage = {
  /** @description 读取并校验完整快照, 不缓存业务数据 */
  async read(): Promise<LocalState> {
    return readState()
  },

  /** @description 阻止新写入并等待已接受的写入结束 */
  pauseWrites(): Promise<void> {
    writesPaused = true
    return writeQueue
  },

  /** @description 恢复新写入, 清空进行中不可恢复 */
  resumeWrites(): void {
    if (clearTask) {
      throw new ApiClientError(ErrorCode.System.Internal, "本地数据正在清空")
    }
    writesPaused = false
  },

  /** @description 等待队列结束, 各操作是否成功以各自返回值为准 */
  flushWrites(): Promise<void> {
    return writeQueue
  },

  /** @description 暂停并排空写入后清空业务快照和内存 key, 结束后保持暂停 */
  clear(): Promise<void> {
    if (clearTask)
      return clearTask
    writesPaused = true
    const task = writeQueue.then(() => {
      const localStorage = getStorage()
      try {
        localStorage.removeItem(LOCAL_STATE_KEY)
        credentials.clear()
      }
      catch {
        throw new ApiClientError(ErrorCode.System.Internal, "无法清空本地数据，请检查浏览器存储权限")
      }
    })
    clearTask = task.finally(() => {
      clearTask = null
    })
    writeQueue = clearTask.then(() => undefined, () => undefined)
    return clearTask
  },
}
