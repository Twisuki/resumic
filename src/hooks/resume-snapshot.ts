import type { Resume } from "@shared/model"
import { useHistory } from "@/hooks/history"
import { deserialize } from "@/lib/tree"
import { useHistoryStore } from "@/stores/history"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 提供 saveAndSnapshot: 触发当前打开简历的保存 (flush + 落库),
 * 等保存流程结束 (保存函数内部已 toast 错误) 后返回 store 里最新的 Resume 快照
 *
 * 保存通过 useHistory().save 触发, 它会同步执行 flushAll 把未提交的输入内容写回 store,
 * 然后异步 POST saveFn. await save() 即等到 POST 完成 (成功或失败都会结束).
 * 若 saveFn 未注册则返回 null; 正在保存中 save() 会 toast "正在保存中" 并立即返回
 *
 * 注意:
 * - 只对当前打开的简历生效 (store 里只持有一份 tree)
 * - 没有打开的简历时返回 null (调用方应检查)
 * - 保存失败时由 save() 内部 toast, 这里返回的快照仍是 store 中的最新内容
 */
export function useResumeSnapshot() {
  const { save } = useHistory()

  async function saveAndSnapshot(): Promise<Resume | null> {
    const { saveFn } = useHistoryStore.getState()
    if (!saveFn)
      return null

    await save()

    const { profile, resume } = useResumeStore.getState()
    if (!profile || !resume)
      return null
    return deserialize({ profile, resume })
  }

  return { saveAndSnapshot }
}
