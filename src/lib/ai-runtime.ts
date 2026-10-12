import { getTrialSnapshot, isModeReady } from "@/lib/trial-mode"

const controllers = new Set<AbortController>()

/** @description 绑定模式代次和取消信号, 迟到的流与工具不能进入新会话 */
export function createAiRun() {
  const controller = new AbortController()
  const { generation } = getTrialSnapshot()
  controllers.add(controller)
  const isActive = () => isModeReady() && generation === getTrialSnapshot().generation
    && controllers.has(controller) && !controller.signal.aborted
  return {
    controller,
    isActive,
    assertActive(): void {
      if (!isActive())
        throw new DOMException("AI 会话已结束", "AbortError")
    },
    finish(): void {
      controllers.delete(controller)
    },
  }
}

export function stopAiRuns(): void {
  for (const controller of controllers)
    controller.abort()
  controllers.clear()
}
