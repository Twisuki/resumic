import type { Resume as ResumeModel } from "@shared/model"
import { Paper, Resume } from "@/components/resume"

export default function Main({
  scale,
  resume,
}: Readonly<{
  scale: number
  resume: ResumeModel
}>) {
  return (
    <main className="flex-1 min-w-0 h-full flex justify-center">
      <Paper scale={scale}>
        <Resume {...resume} />
      </Paper>
    </main>
  )
}
