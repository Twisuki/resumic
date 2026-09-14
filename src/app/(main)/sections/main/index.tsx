import type { Resume as ResumeModel } from "@shared/model"
import { useScale } from "@/app/(main)/hooks/scale"
import { Resume } from "@/components/resume"

export default function Main({
  zoom,
  resume,
}: Readonly<{
  zoom: number
  resume: ResumeModel
}>) {
  const { scale, ref } = useScale<HTMLDivElement>()

  return (
    <main
      ref={ref}
      className="flex-1 min-w-0 h-full flex justify-center overflow-y-auto overflow-x-hidden no-scrollbar"
    >
      <Resume scale={scale} zoom={zoom} {...resume} />
    </main>
  )
}
