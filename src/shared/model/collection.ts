/**
 * @description `{ orders, items }` 结构 id 定序的数组集合
 */
export interface Collection<T extends { id: string }> {
  items: Array<T>
  orders: string[]
}
