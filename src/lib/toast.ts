import { toast as sonner } from "sonner"
import { ApiClientError, isAuthError } from "@/lib/request"

/** @description ApiClientError 与一般 Error 转可读消息, 鉴权错统一文案 */
function describe(e: unknown): string {
  if (e instanceof ApiClientError) {
    if (isAuthError(e))
      return "请重新登录"
    return e.message
  }
  if (e instanceof Error)
    return e.message
  return "未知错误"
}

interface PromiseMsgs<T> {
  loading: string
  success: string | ((data: T) => string)
  /** @description 留空 / 字符串 / 函数 三种形式分别给出错误文案 */
  error?: string | ((e: unknown) => string)
}

/** @description 统一 toast 入口, 含 promise 自动状态机 */
export const t = {
  success: (msg: string): string | number => sonner.success(msg),
  error: (msg: string): string | number => sonner.error(msg),
  info: (msg: string): string | number => sonner.info(msg),
  warning: (msg: string): string | number => sonner.warning(msg),
  loading: (msg: string): string | number => sonner.loading(msg),
  dismiss: (id?: string | number): string | number => sonner.dismiss(id),

  promise: <T>(promise: Promise<T>, msgs: PromiseMsgs<T>): Promise<T> => {
    sonner.promise(promise, {
      loading: msgs.loading,
      success: data =>
        typeof msgs.success === "function" ? msgs.success(data) : msgs.success,
      error: (e) => {
        if (typeof msgs.error === "function")
          return msgs.error(e)
        return msgs.error ? `${msgs.error}: ${describe(e)}` : describe(e)
      },
    })
    return promise
  },
}
