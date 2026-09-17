import { useScale } from "@/app/(main)/hooks/scale"
import { Resume } from "@/components/resume"

export default function Main() {
  const { scale, ref } = useScale<HTMLDivElement>()

  return (
    <main
      ref={ref}
      className="min-w-0 w-full max-w-[794px] h-full flex overflow-y-auto overflow-x-hidden no-scrollbar"
    >
      <Resume scale={scale} />
    </main>
  )
}
