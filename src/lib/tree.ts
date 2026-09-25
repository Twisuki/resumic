import type {
  DetailNode,
  LineNode,
  Node,
  PageNode,
  PartNode,
  ProfileNode,
  ResumeTree,
  RootNode,
  SectionNode,
  Subtree,
  Tree,
} from "@shared/model/node"
import type { Detail, Part, Profile, Resume, Section } from "@shared/model/resume"
import { genId } from "@/lib/id"

/**
 * @description 把 self 与 children ids 写入 Map, 返回新节点 id
 */
function buildNode(map: Map<string, Node>, self: unknown, children: string[]): string {
  const id = genId()
  map.set(id, { id, self, children } as Node)
  return id
}

/**
 * @description 从树读取指定 id 的节点, 缺失时抛错
 */
export function mustGet(tree: Tree, id: string): Node {
  const node = tree.nodes.get(id)
  if (!node)
    throw new Error(`tree miss node ${id}`)
  return node
}

/**
 * @description 递归从 Map 移除节点及其整子树
 */
export function unregisterSubtree(map: Map<string, Node>, node: Node): void {
  for (const childId of node.children) {
    const child = map.get(childId)
    if (child)
      unregisterSubtree(map, child)
  }
  map.delete(node.id)
}

/**
 * @description 浅克隆单个节点, 用于 patch payload 冻结
 */
export function cloneNode(node: Node): Node {
  return {
    id: node.id,
    self: { ...(node.self as Record<string, unknown>) } as never,
    children: [...node.children],
  } as Node
}

/**
 * @description 从树中深克隆一棵子树为自包含快照 (保留原 id)
 */
export function snapshotSubtree(tree: Tree, node: Node): Subtree {
  const nodes: Node[] = []
  const collect = (current: Node): void => {
    nodes.push(cloneNode(current))
    for (const childId of current.children) {
      const child = tree.nodes.get(childId)
      if (child)
        collect(child)
    }
  }
  collect(node)
  return { root: nodes[0], nodes }
}

/**
 * @description 由单个节点构造子树快照 (新增空节点用)
 */
export function leafSubtree(node: Node): Subtree {
  const clone = cloneNode(node)
  return { root: clone, nodes: [clone] }
}

/**
 * @description 区分 Node 与 Subtree
 */
export function isSubtree(value: Node | Subtree): value is Subtree {
  return "root" in value
}

/**
 * @description 注册一个 detail 节点
 */
function buildDetailNode(map: Map<string, Node>, detail: Detail): string {
  return buildNode(map, detail, [])
}

/**
 * @description 读取一个 detail 节点
 */
function readDetail(tree: Tree, id: string): Detail {
  return (mustGet(tree, id) as DetailNode).self
}

/**
 * @description 注册一个 line 节点
 */
function buildLineNode(map: Map<string, Node>, content: string): string {
  return buildNode(map, { content }, [])
}

/**
 * @description 读取一个 line 节点
 */
function readLine(tree: Tree, id: string): string {
  return (mustGet(tree, id) as LineNode).self.content
}

/**
 * @description 注册一个 part 节点, content 按换行拆 line 子节点
 */
function buildPartNode(map: Map<string, Node>, part: Part): string {
  const { content, ...self } = part
  const segments = content.split("\n")
  const children = segments
    .map((c, i) => (i < segments.length - 1 ? `${c}\n` : c))
    .map(c => buildLineNode(map, c))
  return buildNode(map, self, children)
}

/**
 * @description 读取一个 part 节点, line 子节点直接拼回 content
 */
function readPart(tree: Tree, id: string): Part {
  const node = mustGet(tree, id) as PartNode
  const content = node.children.map(cid => readLine(tree, cid)).join("")
  return { ...node.self, content }
}

/**
 * @description 注册一个 section 节点
 */
function buildSectionNode(map: Map<string, Node>, section: Section): string {
  const { part, ...self } = section
  const children = part.map(p => buildPartNode(map, p))
  return buildNode(map, self, children)
}

/**
 * @description 读取一个 section 节点
 */
function readSection(tree: Tree, id: string): Section {
  const node = mustGet(tree, id) as SectionNode
  const part = node.children.map(cid => readPart(tree, cid))
  return { ...node.self, part }
}

/**
 * @description 注册一个 page 节点
 */
function buildPageNode(map: Map<string, Node>, page: { section: Section[] }): string {
  const children = page.section.map(s => buildSectionNode(map, s))
  return buildNode(map, null, children)
}

/**
 * @description 读取一个 page 节点
 */
function readPage(tree: Tree, id: string): { section: Section[] } {
  const node = mustGet(tree, id) as PageNode
  const section = node.children.map(cid => readSection(tree, cid))
  return { section }
}

/**
 * @description 注册一个 profile 节点
 */
function buildProfileNode(map: Map<string, Node>, profile: Profile): string {
  const { detail, ...self } = profile
  const children = detail.map(d => buildDetailNode(map, d))
  return buildNode(map, self, children)
}

/**
 * @description 读取 profile 节点的 self 字段
 */
function readProfileFields(tree: Tree, id: string): Omit<Profile, "detail"> {
  return (mustGet(tree, id) as ProfileNode).self
}

/**
 * @description 把 Resume 序列化为完整简历树
 */
export function serialize(resume: Resume): ResumeTree {
  const profileMap = new Map<string, Node>()
  const profileId = buildProfileNode(profileMap, resume)

  const resumeMap = new Map<string, Node>()
  const pageIds = resume.page.map(p => buildPageNode(resumeMap, p))
  const rootId = buildNode(resumeMap, { title: resume.title, zoom: resume.zoom }, pageIds)

  return {
    profile: { nodes: profileMap, rootId: profileId },
    resume: { nodes: resumeMap, rootId },
  }
}

/**
 * @description 把完整简历树反序列化为 Resume
 */
export function deserialize(trees: ResumeTree): Resume {
  const { profile, resume } = trees

  const profileFields = readProfileFields(profile, profile.rootId)
  const detail = (mustGet(profile, profile.rootId) as ProfileNode).children.map(id => readDetail(profile, id))

  const rootNode = mustGet(resume, resume.rootId) as RootNode
  const { title, zoom } = rootNode.self
  const page = rootNode.children.map(id => readPage(resume, id))

  return {
    ...profileFields,
    detail,
    title,
    zoom,
    page,
  }
}
