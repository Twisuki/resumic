import type { Part as PartModel } from "@shared/model"
import { RichContent } from "@/components/rich-content"

export default function Part({
  title,
  subtitle,
  link,
  date,
  content,
}: Readonly<PartModel>) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3">
            {title && <h3 className="text-lg font-bold">{title}</h3>}
            {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
          </div>
          {date && <span className="text-muted-foreground">{date}</span>}
        </div>
        {link && <span className="text-sm text-muted-foreground">{link}</span>}
      </header>

      <RichContent value={content} />
    </section>
  )
}
