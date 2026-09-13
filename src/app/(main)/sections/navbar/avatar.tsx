import { IconUser } from "@tabler/icons-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * @description 账号头像, 无地址时退化为占位图标
 */
export default function Avatar({
  name,
  url,
  className,
}: Readonly<{
  name?: string
  url?: string | null
  className?: string
}>) {
  if (!url) {
    return (
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground",
          className,
        )}
        aria-hidden
      >
        <IconUser className="size-5" />
      </div>
    )
  }

  return (
    <Image
      src={url}
      alt={name ?? "用户头像"}
      width={32}
      height={32}
      className={cn("rounded-full object-cover", className)}
    />
  )
}
