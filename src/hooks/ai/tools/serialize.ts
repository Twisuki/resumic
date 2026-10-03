import type {
  DetailNode,
  LineNode,
  Node,
  PageNode,
  PartNode,
  ProfileNode,
  RootNode,
  SectionNode,
  Tree,
} from "@shared/model/node"
import { useResumeStore } from "@/stores/resume"

export type NodeKind = "root" | "profile" | "detail" | "page" | "section" | "part" | "line"

export type WalkMode = "structure" | "profile"

/**
 * @description 由 self 形状推断节点 kind, 仅在工具序列化里用, 业务侧不要引
 */
function getKind(node: Node): NodeKind {
  const self = node.self
  if (self === null)
    return "page"
  if ("zoom" in self)
    return "root"
  if ("name" in self)
    return "profile"
  if ("subtitle" in self)
    return "part"
  if ("icon" in self && "content" in self)
    return "detail"
  if ("icon" in self && "title" in self)
    return "section"
  if ("content" in self)
    return "line"
  throw new Error(`serialize: unknown node kind at ${node.id}`)
}

/**
 * @description 递归把子树转成可发给模型的 JSON 形状
 *
 * structure 模式 (read_structure): line 只露 id (无 content, 编辑器独占), part 只露 title, detail 只露 icon
 * profile  模式 (read_profile):   全字段 (profile 树本无 line, 走不到 line case)
 */
function walk(node: Node, tree: Tree, mode: WalkMode): unknown {
  const kind = getKind(node)
  const children: unknown[] = []
  for (const childId of node.children) {
    const child = tree.nodes.get(childId)
    if (child)
      children.push(walk(child, tree, mode))
  }

  switch (kind) {
    case "line":
      return { id: (node as LineNode).id, kind: "line" }
    case "page":
      return { id: (node as PageNode).id, kind: "page", children }
    case "root": {
      const s = (node as RootNode).self
      return { id: node.id, kind: "root", title: s.title, zoom: s.zoom, children }
    }
    case "profile": {
      const s = (node as ProfileNode).self
      return {
        id: node.id,
        kind: "profile",
        name: s.name,
        headline: s.headline,
        age: s.age,
        gender: s.gender,
        phone: s.phone,
        email: s.email,
        avatar: s.avatar,
        children,
      }
    }
    case "section": {
      const s = (node as SectionNode).self
      return { id: node.id, kind: "section", icon: s.icon, title: s.title, children }
    }
    case "part":
      return mode === "structure"
        ? { id: node.id, kind: "part", title: (node as PartNode).self.title, children }
        : (() => {
            const s = (node as PartNode).self
            return {
              id: node.id,
              kind: "part",
              title: s.title,
              subtitle: s.subtitle,
              link: s.link,
              date: s.date,
              children,
            }
          })()
    case "detail":
      return mode === "structure"
        ? { id: node.id, kind: "detail", icon: (node as DetailNode).self.icon, children }
        : (() => {
            const s = (node as DetailNode).self
            return { id: node.id, kind: "detail", icon: s.icon, content: s.content, children }
          })()
  }
}

/**
 * @description 从 profile / resume 双树里定位节点, 命中任一即返回, 都未命中返回 null
 */
export function findTreeForNode(id: string): { tree: Tree, node: Node } | null {
  const { profile, resume } = useResumeStore.getState()
  if (profile?.nodes.has(id)) {
    const node = profile.nodes.get(id)
    if (node)
      return { tree: profile, node }
  }
  if (resume?.nodes.has(id)) {
    const node = resume.nodes.get(id)
    if (node)
      return { tree: resume, node }
  }
  return null
}

/**
 * @description 序列化指定节点所在子树, mode 决定字段粒度; 未命中返回 null
 */
export function walkFromNode(id: string, mode: WalkMode): unknown | null {
  const found = findTreeForNode(id)
  if (!found)
    return null
  return walk(found.node, found.tree, mode)
}

/**
 * @description 序列化 resume 根 (默认起点), resume 未加载返回 null
 */
export function walkResumeRoot(mode: WalkMode): unknown | null {
  const { resume } = useResumeStore.getState()
  if (!resume)
    return null
  const root = resume.nodes.get(resume.rootId)
  if (!root)
    return null
  return walk(root, resume, mode)
}

/**
 * @description 序列化 profile 根, profile 未加载返回 null
 */
export function walkProfileRoot(mode: WalkMode): unknown | null {
  const { profile } = useResumeStore.getState()
  if (!profile)
    return null
  const root = profile.nodes.get(profile.rootId)
  if (!root)
    return null
  return walk(root, profile, mode)
}
