import type { Avatar } from "@/server/model/avatar"
import type { Content } from "@/server/model/content"

export interface Resume extends Profile {
  sections: ResumeSection[]
}

export interface Profile {
  name: string
  email?: string
  phone?: string
  avatar?: Avatar
  age?: string
  school?: string
  major?: string
  customs: ProfileItem[]
}

export interface ProfileItem {
  icon: string
  content: string
}

export interface Section {
  icon: string
  title: string
  parts: Part[]
}

export interface ResumeSection extends Section {
  type: string
}

export interface Part {
  title: string
  subtitle: string
  link: string
  date: string
  content: Content
}
