import { useSidebarsContext } from "@/app/(main)/contexts/sidebar"

export interface SidebarsBusiness {
  isMobile: boolean
  isLeftOpen: boolean
  isRightOpen: boolean

  toggleLeft: () => void
  toggleRight: () => void

  onLeftOpenChange: (open: boolean) => void
  onRightOpenChange: (open: boolean) => void

  close: () => void
}

export function useSidebars(): SidebarsBusiness {
  const { isMobile, active, setActive } = useSidebarsContext()
  return {
    isMobile,
    isLeftOpen: active === "left",
    isRightOpen: active === "right",
    toggleLeft: () => setActive(prev => prev === "left" ? null : "left"),
    toggleRight: () => setActive(prev => prev === "right" ? null : "right"),
    onLeftOpenChange: open => setActive(open ? "left" : null),
    onRightOpenChange: open => setActive(open ? "right" : null),
    close: () => setActive(null),
  }
}
