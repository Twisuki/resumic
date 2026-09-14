import type { RefObject } from "react"
import { useEffect, useRef, useState } from "react"
import { PAPER } from "@/config/paper"

const MAX_SCALE = 1

/**
 * @description 监听容器宽度算 Paper 整体缩放比例
 */
export function useScale<T extends HTMLElement>(): {
  scale: number
  ref: RefObject<T | null>
} {
  const ref = useRef<T>(null)
  const [scale, setScale] = useState(MAX_SCALE)

  useEffect(() => {
    const el = ref.current
    if (!el)
      return

    const recalc = () => {
      setScale(Math.min(el.clientWidth / PAPER.WIDTH, MAX_SCALE))
    }

    queueMicrotask(recalc)

    const ro = new ResizeObserver(recalc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return { scale, ref }
}
