import type { Content } from "@shared/model"

/**
 * @description 把 Content 按 orders 顺序拼回 md 源字符串
 *
 * `\n` 归属上一行, 所以顺序拼接即可还原; 未被 orders 引用的行会被丢弃
 */
export function serializeContent(content: Content): string {
  const byId = new Map(content.lines.map(line => [line.id, line.content]))
  return content.orders.map(id => byId.get(id) ?? "").join("")
}
