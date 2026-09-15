import { useScale } from "@/app/(main)/hooks/scale"
import { Resume } from "@/components/resume"
import { useResumeStore } from "@/stores/resume"

export default function Main() {
  const { scale, ref } = useScale<HTMLDivElement>()
  const current = useResumeStore(state => state.current)

  return (
    <main
      ref={ref}
      className="flex-1 min-w-0 h-full flex overflow-y-auto overflow-x-hidden no-scrollbar"
    >
      {current
        ? <Resume scale={scale} {...current} />
        : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              未加载简历
            </div>
          )}
    </main>
  )
}
