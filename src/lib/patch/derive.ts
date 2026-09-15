import type { Collection, Resume } from "@shared/model"
import type {
  FieldSetPatch,
  ItemAddPatch,
  ItemRemovePatch,
  ItemUpdatePatch,
  Path,
  ReorderPatch,
} from "@shared/model/patch"
import { getAtPath } from "@/lib/patch/apply"

/**
 * @description 深比较, 仅处理字符串与对象
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b)
    return true
  if (a === null || b === null)
    return a === b
  if (typeof a !== typeof b)
    return false
  if (typeof a !== "object")
    return false

  if (Array.isArray(a) !== Array.isArray(b))
    return false

  if (Array.isArray(a)) {
    const arrB = b as unknown[]
    if (a.length !== arrB.length)
      return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], arrB[i]))
        return false
    }
    return true
  }

  const aKeys = Object.keys(a as object)
  const bKeys = Object.keys(b as object)
  if (aKeys.length !== bKeys.length)
    return false
  for (const key of aKeys) {
    if (!deepEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
    )) {
      return false
    }
  }
  return true
}

/**
 * @description 算 field_set patch
 */
export function fieldSetPatch(state: Resume, path: Path, after: unknown): FieldSetPatch | null {
  const before = getAtPath(state, path)
  if (deepEqual(before, after))
    return null
  return { type: "field_set", path, payload: null, before, after }
}

/**
 * @description 算 item_add patch, at 不传则追加末尾
 */
export function itemAddPatch(
  state: Resume,
  path: Path,
  item: { id: string },
  at?: number,
): ItemAddPatch | null {
  const collection = getAtPath(state, path) as Collection<{ id: string }>
  const beforeOrders = collection.orders
  const afterOrders = at === undefined
    ? [...beforeOrders, item.id]
    : [...beforeOrders.slice(0, at), item.id, ...beforeOrders.slice(at)]
  if (deepEqual(beforeOrders, afterOrders))
    return null
  return { type: "item_add", path, payload: item, before: beforeOrders, after: afterOrders }
}

/**
 * @description 算 item_remove patch
 */
export function itemRemovePatch(state: Resume, path: Path, id: string): ItemRemovePatch | null {
  const collection = getAtPath(state, path) as Collection<{ id: string }>
  const item = collection.items.find(i => i.id === id)
  if (!item)
    return null
  const beforeOrders = collection.orders
  const afterOrders = beforeOrders.filter(o => o !== id)
  if (deepEqual(beforeOrders, afterOrders))
    return null
  return { type: "item_remove", path, payload: item, before: beforeOrders, after: afterOrders }
}

/**
 * @description 算 item_update patch
 */
export function itemUpdatePatch(state: Resume, path: Path, after: unknown): ItemUpdatePatch | null {
  const before = getAtPath(state, path)
  if (deepEqual(before, after))
    return null
  return { type: "item_update", path, payload: null, before, after }
}

/**
 * @description 算 reorder patch
 */
export function reorderPatch(state: Resume, path: Path, afterOrders: string[]): ReorderPatch | null {
  const collection = getAtPath(state, path) as Collection<{ id: string }>
  const beforeOrders = collection.orders
  if (deepEqual(beforeOrders, afterOrders))
    return null
  return { type: "reorder", path, payload: null, before: beforeOrders, after: afterOrders }
}
