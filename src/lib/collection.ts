import type { Collection } from "@shared/model"

/**
 * @description 按 orders 顺序展平 collection 得到 Array<T>
 */
export function flatten<T extends { id: string }>(collection: Collection<T>): Array<T> {
  const byId = new Map(collection.items.map(item => [item.id, item]))
  return collection.orders
    .map(id => byId.get(id))
    .filter((item): item is T => item !== undefined)
}
