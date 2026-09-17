import type { Node } from "@shared/model/node"

/**
 * @description Patch 行为
 */
export type PatchAction = "UPDATE" | "ADD" | "REMOVE" | "REORDER"

/**
 * @description Patch 基底
 */
export interface BasePatch<A extends PatchAction, P, T> {
  type: A
  id: string
  payload: P
  before: T
  after: T
}

/**
 * @description 更新字段 Patch
 */
export type UpdatePatch = BasePatch<"UPDATE", string, unknown>

/**
 * @description 新增节点 Patch
 */
export type AddPatch = BasePatch<"ADD", Node, string[]>

/**
 * @description 删除节点 Patch
 */
export type RemovePatch = BasePatch<"REMOVE", Node, string[]>

/**
 * @description 顺序调整 Patch
 */
export type ReorderPatch = BasePatch<"REORDER", null, string[]>

/**
 * @description 简历变更行为
 */
export type Patch = UpdatePatch | AddPatch | RemovePatch | ReorderPatch

/**
 * @description 编辑历史栈
 */
export interface History {
  past: Patch[]
  future: Patch[]
}
