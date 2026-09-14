import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

export default function IconAction({ variant = "ghost", ...props }: ComponentProps<typeof Button>) {
  return <Button variant={variant} size="icon-xs" {...props} />
}
