import type { Content, Part as PartModel } from "@shared/model"

/**
 * @description 占位: 把 Content 按 orders 顺序拼回纯文本. 后续换成自研 markdown 解析器
 */
function toPlainText(content: Content): string {
  return content.orders
    .map(id => content.lines.find(line => line.id === id)?.content ?? "")
    .join("")
}

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

      <p className="whitespace-pre-wrap">{toPlainText(content)}</p>
    </section>
  )
}
