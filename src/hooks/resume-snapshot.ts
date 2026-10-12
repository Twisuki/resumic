import type { Resume } from "@shared/model"
import { useHistory } from "@/hooks/history"
import { deserialize } from "@/lib/tree"
import { useHistoryStore } from "@/stores/history"
import { useResumeStore } from "@/stores/resume"

/** @description 普通导出保留当前编辑快照, 关闭或登录使用严格保存结果 */
export function useResumeSnapshot() {
  const { save, saveStrict } = useHistory()

  async function saveAndSnapshot(): Promise<Resume | null> {
    if (!useHistoryStore.getState().saveFn)
      return null

    await save()

    const { profile, resume } = useResumeStore.getState()
    if (!profile || !resume)
      return null
    return deserialize({ profile, resume })
  }

  return { saveAndSnapshot, saveStrictAndSnapshot: saveStrict }
}
