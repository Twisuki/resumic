import { useResumeStore } from "@/stores/resume"

export function useResume() {
  const id = useResumeStore(s => s.id)
  const profileTree = useResumeStore(s => s.profile)
  const resumeTree = useResumeStore(s => s.resume)
  const open = useResumeStore(s => s.open)
  const close = useResumeStore(s => s.close)

  const profileRootId = profileTree?.rootId ?? null
  const resumeRootId = resumeTree?.rootId ?? null

  return { id, profileRootId, resumeRootId, open, close }
}
