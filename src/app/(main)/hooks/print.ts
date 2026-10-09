import type { PrintContextValue } from "@/app/(main)/contexts/print"
import { use } from "react"
import { PrintContext } from "@/app/(main)/contexts/print"
import { useResume } from "@/hooks/resume"

/**
 * @description 取打印 hook, 同时把当前打开简历的 id 一起导出
 *
 * - id: 当前 useResume().id (正在编辑的简历)
 * - trigger: 触发打印, id 由调用方指定 (要打印的目标简历)
 * - register: PrintFrame 注册自己的导航 handler
 */
export function usePrint(): PrintContextValue & { id: number | null } {
  const ctx = use(PrintContext)
  if (!ctx)
    throw new Error("usePrint must be used within PrintProvider")
  const { id } = useResume()
  return { ...ctx, id }
}
