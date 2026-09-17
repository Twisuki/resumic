import type { Avatar } from "@shared/model/avatar"

/**
 * @description Profile 自定义信息项目
 */
export interface Detail {
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
  detail: Detail[]
}

/**
 * @description 简历章节模块
 */
export interface Part {
  title: string
  subtitle: string
  link: string
  date: string
  content: string
}

/**
 * @description 简历章节
 */
export interface Section {
  icon: string
  title: string
  part: Part[]
}

/**
 * @description 简历分页
 */
export interface Page {
  section: Section[]
}

/**
 * @description 完整简历
 */
export interface Resume extends Profile {
  title: string
  zoom: number
  page: Page[]
}
