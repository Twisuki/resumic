/**
 * @description patch 类型标识
 */
export type PatchAction = "field_set" | "item_add" | "item_remove" | "item_update" | "reorder"

/**
 * @description 原子路径
 */
export type PathStep = string

/**
 * @description 从 root 到目标字段的路径
 */
export type Path = PathStep[]

/**
 * @description 所有 patch 的统一基底
 */
export interface BasePatch<T, D> {
  type: PatchAction
  path: Path
  payload: T
  before: D
  after: D
}

/**
 * @description 普通字段整体替换
 *
 * payload 为空, before/after 为字段原值与新值
 */
export type FieldSetPatch = BasePatch<null, unknown>

/**
 * @description collection 新增项
 *
 * payload 为新增项, before/after 为 orders 修改前与修改后
 */
export type ItemAddPatch = BasePatch<{ id: string }, string[]>

/**
 * @description collection 删除项
 *
 * payload 为被删项, before/after 为 orders 修改前与修改后
 */
export type ItemRemovePatch = BasePatch<{ id: string }, string[]>

/**
 * @description collection 项整体替换
 *
 * payload 为空, before/after 为 item 原整体与新整体
 */
export type ItemUpdatePatch = BasePatch<null, unknown>

/**
 * @description collection 顺序调整
 *
 * payload 为空, before/after 为 orders 修改前与修改后
 */
export type ReorderPatch = BasePatch<null, string[]>

/**
 * @description 简历变更行为
 */
export type Patch = FieldSetPatch | ItemAddPatch | ItemRemovePatch | ItemUpdatePatch | ReorderPatch

/**
 * @description 编辑历史栈
 */
export interface History {
  past: Patch[]
  future: Patch[]
}
