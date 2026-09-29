import { z } from "zod"

/**
 * @description 工具权限等级: always (放行) / ask (弹框) / deny (直接拒, 暂时不接, 留作反相)
 */
export const PERMISSIONS = ["always", "ask", "deny"] as const
export type Permission = typeof PERMISSIONS[number]

/**
 * @description 7 个工具的字面量联合, 给 SDK + permission gate 用
 */
export const TOOL_NAMES = [
  "read_structure",
  "read_content",
  "read_profile",
  "replace_field",
  "insert_node",
  "remove_node",
  "reorder_nodes",
] as const
export type ToolName = typeof TOOL_NAMES[number]

/**
 * @description read_structure: 不传 nodeId = resume 根
 */
export const readStructureInput = z.object({
  nodeId: z.string().optional(),
})

/**
 * @description read_content: 单节点的 self (不含 children 详情)
 */
export const readContentInput = z.object({
  nodeId: z.string(),
})

/**
 * @description read_profile: 无输入, 整棵 profile 树
 */
export const readProfileInput = z.object({})

/**
 * @description replace_field: 修改单个字段, key 是 node.self 的字段名, value 由模型按节点 kind 自决
 */
export const replaceFieldInput = z.object({
  nodeId: z.string(),
  key: z.string(),
  value: z.unknown(),
})

/**
 * @description insert_node: 由模型给 kind + self, 客户端 genId 后走 patch.add
 */
export const insertNodeInput = z.object({
  parentId: z.string(),
  node: z.object({
    kind: z.enum(["detail", "page", "section", "part", "line"]),
    self: z.unknown(),
    children: z.array(z.string()).optional(),
  }),
})

/**
 * @description remove_node: 1:1 走 patch.remove
 */
export const removeNodeInput = z.object({
  parentId: z.string(),
  childId: z.string(),
})

/**
 * @description reorder_nodes: order 是 parent.children 的完整新顺序
 */
export const reorderNodesInput = z.object({
  parentId: z.string(),
  order: z.array(z.string()),
})
