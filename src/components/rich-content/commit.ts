import type { LineNode, Subtree } from "@shared/model/node"
import { genId } from "@/lib/id"
import { leafSubtree } from "@/lib/tree"
import { useResumeStore } from "@/stores/resume"

/**
 * @description 高层 patch 操作类型 (与 hooks/history 的 patch 形状一致)
 */
export interface PatchOps {
  update: (id: string, key: string, after: unknown) => void
  add: (parentId: string, payload: Subtree) => void
  remove: (parentId: string, childId: string) => void
  reorder: (parentId: string, afterOrders: string[]) => void
}

/**
 * @description 取出 parent 节点下当前所有 children 的 id; 不存在则返空
 */
export function readChildren(parentId: string): string[] {
  const { profile, resume } = useResumeStore.getState()
  const tree = profile?.nodes.has(parentId) ? profile : resume
  if (!tree)
    return []
  return [...(tree.nodes.get(parentId)?.children ?? [])]
}

/**
 * @description 取出指定 LineNode 的 content; 缺则返 ""
 */
export function readLineContent(parentId: string, lineId: string): string {
  const { profile, resume } = useResumeStore.getState()
  const tree = profile?.nodes.has(parentId) ? profile : resume
  if (!tree)
    return ""
  const node = tree.nodes.get(lineId) as LineNode | undefined
  return node?.self.content ?? ""
}

/**
 * @description 数组相等
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length)
    return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i])
      return false
  }
  return true
}

/**
 * @description 把 joined source 落库: 前缀 + 后缀匹配, 中段走 update / add / remove / reorder
 * 不依赖 React state, 纯函数 + patch 调用
 *
 * 这是 rich-content 编辑唯一的写库入口: 跨行 / 跨字符 / 多行粘贴 / 删除 / 全部归一为 joined source 比对
 */
export function commitLines(
  parentId: string,
  newSource: string,
  patch: PatchOps,
): void {
  const oldIds = readChildren(parentId)
  const oldLines = oldIds.map(id => readLineContent(parentId, id))
  const newLines = newSource.split("\n")

  // 前缀匹配
  let prefix = 0
  while (
    prefix < oldLines.length
    && prefix < newLines.length
    && oldLines[prefix] === newLines[prefix]
  ) {
    prefix++
  }

  // 后缀匹配 (前后不重叠)
  let suffix = 0
  while (
    suffix < oldLines.length - prefix
    && suffix < newLines.length - prefix
    && oldLines[oldLines.length - 1 - suffix] === newLines[newLines.length - 1 - suffix]
  ) {
    suffix++
  }

  const oldMid = oldLines.length - prefix - suffix
  const newMid = newLines.length - prefix - suffix
  const updateCount = Math.min(oldMid, newMid)

  // 1. 中段既有行: 内容变化就 update
  for (let k = 0; k < updateCount; k++) {
    if (oldLines[prefix + k] !== newLines[prefix + k])
      patch.update(oldIds[prefix + k], "content", newLines[prefix + k])
  }

  // 2. 多出来的新行: add 并记录 id (供 reorder 使用)
  const addedIds: string[] = []
  for (let k = updateCount; k < newMid; k++) {
    const id = genId()
    addedIds.push(id)
    patch.add(parentId, leafSubtree({
      id,
      self: { content: newLines[prefix + k] },
      children: [],
    }))
  }

  // 3. 多出来的旧行: remove
  for (let k = updateCount; k < oldMid; k++) {
    patch.remove(parentId, oldIds[prefix + k])
  }

  // 4. 顺序若变: reorder
  const finalIds = [
    ...oldIds.slice(0, prefix),
    ...oldIds.slice(prefix, prefix + updateCount),
    ...addedIds,
    ...oldIds.slice(prefix + oldMid),
  ]
  if (!arraysEqual(finalIds, oldIds))
    patch.reorder(parentId, finalIds)
}
