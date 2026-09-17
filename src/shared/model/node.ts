import type { Avatar } from "@shared/model/avatar"

/**
 * @description 节点基底
 */
export interface BaseNode<T> {
  id: string
  self: T
  children: string[]
}

/**
 * @description Root 节点
 */
export type RootNode = BaseNode<{ title: string, zoom: number }>

/**
 * @description Profile 节点
 */
export type ProfileNode = BaseNode<{
  name: string
  headline?: string
  age?: string
  gender?: string
  phone?: string
  email?: string
  avatar?: Avatar
}>

/**
 * @description Detail 节点
 */
export type DetailNode = BaseNode<{ icon: string, content: string }>

/**
 * @description Page 节点
 */
export type PageNode = BaseNode<null>

/**
 * @description Section 节点
 */
export type SectionNode = BaseNode<{ icon: string, title: string }>

/**
 * @description Part 节点
 */
export type PartNode = BaseNode<{
  title: string
  subtitle: string
  link: string
  date: string
}>

/**
 * @description Line 节点
 */
export type LineNode = BaseNode<{ content: string }>

/**
 * @description 简历节点树
 */
export type Node = RootNode | ProfileNode | DetailNode | PageNode | SectionNode | PartNode | LineNode

/**
 * @description 单棵节点树
 */
export interface Tree {
  nodes: Map<string, Node>
  rootId: string
}

/**
 * @description 完整简历树
 */
export interface ResumeTree {
  profile: Tree
  resume: Tree
}
