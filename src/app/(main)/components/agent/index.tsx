import { cn } from "@/lib/utils"

export default function Agent({
  isOpen,
  onClose,
}: Readonly<{
  isOpen: boolean
  onClose: () => void
}>) {
  return (
    <div
      className={cn(
        "absolute inset-0 md:relative md:inset-auto",
        "z-40 md:z-auto",
        "flex",
        isOpen ? "bg-black/50 max-md:pointer-events-auto" : "max-md:pointer-events-none",
        "md:bg-transparent",
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-64 bg-background",
          "md:relative md:inset-auto",
          "flex h-full flex-col",
          isOpen
            ? "animate-in slide-in-from-left"
            : "animate-out slide-out-to-left fill-mode-forwards",
          "md:animate-none md:fill-mode-none",
        )}
        onClick={e => e.stopPropagation()}
      >
        agent
      </div>
    </div>
  )
}
