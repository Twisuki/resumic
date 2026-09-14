import type { Avatar } from "@shared/model/avatar"
import type { Collection } from "@shared/model/collection"
import type { RichContent } from "@shared/model/rich-content"

/**
 * @description Profile 自定义信息项目
 */
export interface Detail {
  id: string
  icon: string
  content: string
}

/**
 * @description 个人信息基础字段
 */
export interface Profile {
  name: string
  headline?: string
  age?: string
  gender?: string
  phone?: string
  email?: string
  avatar?: Avatar
  detail: Collection<Detail>
}

/**
 * @description 简历章节模块
 */
export interface Part {
  id: string
  title: string
  subtitle: string
  link: string
  date: string
  content: RichContent
}

/**
 * @description 简历章节
 */
export interface Section {
  id: string
  icon: string
  title: string
  part: Collection<Part>
}

export interface Page {
  id: string
  section: Collection<Section>
}

/**
 * @description 完整简历
 */
export interface Resume extends Profile {
  title: string
  page: Collection<Page>
}
