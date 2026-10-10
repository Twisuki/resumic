/**
 * @description 打印 iframe 与主窗口之间的消息协议
 *
 * 流程:
 *   1. 主页面把隐藏 iframe 的 src 切到 /print/${id}
 *   2. 打印页 fetch 简历, 灌入本地 store, 渲染完成后自己调 window.print()
 *   3. 鉴权失败 / 简历不存在 / 其他异常时, 打印页通过 postMessage 通知父窗口
 *   4. 父窗口在 PrintFrame 内挂 message 监听, 收到后 toast
 *
 * iframe 是独立 window, 拿不到主窗口的 Toaster, 必须走 postMessage.
 * 协议只发"失败"原因; 成功是隐式的 (用户能看到打印对话框弹出).
 */

export const PRINT_MESSAGE_TYPE = "resumic:print-result" as const

export type PrintErrorKind = "auth" | "not-found" | "unknown"

export interface PrintErrorMessage {
  type: typeof PRINT_MESSAGE_TYPE
  kind: PrintErrorKind
  msg: string
}

export type PrintMessage = PrintErrorMessage

/**
 * @description 任意 -> PrintMessage 的类型守卫, 校验必要字段
 */
export function isPrintMessage(value: unknown): value is PrintMessage {
  if (!value || typeof value !== "object")
    return false
  const m = value as Record<string, unknown>
  return m.type === PRINT_MESSAGE_TYPE
    && (m.kind === "auth" || m.kind === "not-found" || m.kind === "unknown")
    && typeof m.msg === "string"
}

/**
 * @description 打印页调用: 把失败原因推给父窗口
 *
 * 在 iframe 里调用时, target 通常是 window.parent.
 * 非 iframe 环境下调用是 no-op (target === window 时跳过, 避免自发自收).
 */
export function postPrintError(kind: PrintErrorKind, msg: string, target: Window): void {
  if (target === window)
    return
  target.postMessage(
    { type: PRINT_MESSAGE_TYPE, kind, msg } satisfies PrintErrorMessage,
    "*",
  )
}
