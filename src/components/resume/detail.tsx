import Icon from "@/components/icon"

export default function Detail({
  icon,
  content,
}: Readonly<{
  icon: string
  content: string
}>) {
  return (
    <div className="flex items-center gap-1">
      <Icon name={icon} className="size-4 shrink-0" />
      <span>{content}</span>
    </div>
  )
}
