import type { TablerIcon } from "@tabler/icons-react"

export default function Detail({
  icon: Icon,
  content,
}: Readonly<{
  icon: TablerIcon
  content: string
}>) {
  return (
    <div className="flex items-center gap-1">
      <Icon className="size-4 shrink-0" />
      <span>{content}</span>
    </div>
  )
}
