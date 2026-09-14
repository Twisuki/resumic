import type { Part as PartModel } from "@shared/model"
import { RichContent } from "@/components/rich-content"

export default function Part({
  title,
  subtitle,
  link,
  date,
  content,
}: Readonly<PartModel>) {
  const hasHeader = Boolean(title || subtitle || link || date)

  return (
    <section className="flex flex-col gap-2">
      {hasHeader && (
        <header className="flex flex-col">
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-end gap-3">
              {title && <h3 className="text-lg font-bold">{title}</h3>}
              {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
            </div>
            {date && <span className="text-muted-foreground">{date}</span>}
          </div>
          {link && <span className="text-sm text-muted-foreground">{link}</span>}
        </header>
      )}

      <RichContent
        value={content}
        className="space-y-2"
      />
    </section>
  )
}
