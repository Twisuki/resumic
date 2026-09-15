import type { Collection, Resume } from "@shared/model"
import type { ItemAddPatch, ItemRemovePatch, Patch, ReorderPatch } from "@shared/model/patch"

/**
 * @description 判断是否为 collection 形态
 */
function isCollection(obj: unknown): obj is Collection<{ id: string }> {
  if (!obj || typeof obj !== "object")
    return false
  const c = obj as Collection<{ id: string }>
  return Array.isArray(c.items) && Array.isArray(c.orders)
}

/**
 * @description 沿路径取值, items 段跳进 collection
 */
export function getAtPath(obj: unknown, path: string[]): unknown {
  let cur = obj
  let i = 0
  while (i < path.length) {
    if (path[i] === "items" && isCollection(cur) && i + 1 < path.length) {
      const id = path[i + 1]
      cur = cur.items.find(item => item.id === id)
      i += 2
      continue
    }
    cur = (cur as Record<string, unknown>)[path[i]]
    i += 1
  }
  return cur
}

/**
 * @description 沿路径 immutable 设值, items 段跳进 collection
 */
export function setAtPath(obj: unknown, path: string[], value: unknown): unknown {
  if (path.length === 0)
    return value

  const [head, ...tail] = path

  if (head === "items" && isCollection(obj) && tail.length > 0) {
    const id = tail[0]
    const restTail = tail.slice(1)
    const newItems = obj.items.map((item) => {
      if (item.id !== id)
        return item
      return restTail.length === 0 ? value : setAtPath(item, restTail, value)
    })
    return { ...obj, items: newItems }
  }

  return {
    ...(obj as Record<string, unknown>),
    [head]: setAtPath((obj as Record<string, unknown>)[head], tail, value),
  }
}

/**
 * @description 在 path 指向的 collection 上 immutable 应用 updater
 */
function updateCollection(resume: Resume, path: string[], updater: (c: Collection<{ id: string }>) => Collection<{ id: string }>): Resume {
  const collection = getAtPath(resume, path) as Collection<{ id: string }>
  return setAtPath(resume, path, updater(collection)) as Resume
}

/**
 * @description 应用 patch 到 resume
 */
export function applyPatch(resume: Resume, patch: Patch): Resume {
  switch (patch.type) {
    case "field_set":
      return setAtPath(resume, patch.path, patch.after) as Resume
    case "item_update":
      return setAtPath(resume, patch.path, patch.after) as Resume
    case "item_add": {
      const p = patch as ItemAddPatch
      return updateCollection(resume, p.path, c => ({
        ...c,
        items: [...c.items, p.payload],
        orders: p.after,
      }))
    }
    case "item_remove": {
      const p = patch as ItemRemovePatch
      return updateCollection(resume, p.path, c => ({
        ...c,
        items: c.items.filter(item => item.id !== p.payload.id),
        orders: p.after,
      }))
    }
    case "reorder": {
      const p = patch as ReorderPatch
      return updateCollection(resume, p.path, c => ({
        ...c,
        orders: p.after,
      }))
    }
  }
}
