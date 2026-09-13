import type { Avatar } from "@shared/model/avatar"
import type { Content } from "@shared/model/content"

export interface Resume extends Profile {
  title: string
  sections: ResumeSection[]
}

export interface Profile {
  name: string
  headline?: string
  age?: string
  gender?: string
  phone?: string
  email?: string
  avatar?: Avatar
  details: ProfileDetail[]
}

export interface ProfileDetail {
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
