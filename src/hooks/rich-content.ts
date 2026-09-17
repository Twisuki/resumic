import type { LineNode } from "@shared/model"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 富文本 node 转 markdown 字符串 hook
 */
export function useRichContent(ids: string[]) {
  const profileTree = useResumeStore(s => s.profile)
  const resumeTree = useResumeStore(s => s.resume)

  return ids
    .map((id) => {
      const node = profileTree?.nodes.get(id) ?? resumeTree?.nodes.get(id)
      return (node as LineNode | undefined)?.self.content ?? ""
    })
    .join("")
}
