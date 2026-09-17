import { useResumeStore } from "@/stores/resume"

/**
 * @description 简历节点 hook
 */
export function useNode(id: string) {
  const profileTree = useResumeStore(s => s.profile)
  const resumeTree = useResumeStore(s => s.resume)

  if (!profileTree || !resumeTree)
    return undefined
  return profileTree.nodes.get(id) ?? resumeTree.nodes.get(id)
}
