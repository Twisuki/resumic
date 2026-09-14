import type { Resume } from "@shared/model/resume"
import { z } from "zod"

function collection<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    orders: z.array(z.string()),
  })
}

const avatarSchema = z.object({
  url: z.string(),
  uploadedAt: z.string(),
})

const detailSchema = z.object({
  id: z.string(),
  icon: z.string(),
  content: z.string(),
})

const contentLineSchema = z.object({
  id: z.string(),
  content: z.string(),
})

const partSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  link: z.string(),
  date: z.string(),
  content: collection(contentLineSchema),
})

const sectionSchema = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  part: collection(partSchema),
})

const pageSchema = z.object({
  id: z.string(),
  section: collection(sectionSchema),
})

/**
 * @description Resume 的 schema
 * @see Resume
 */
export const resumeSchema: z.ZodType<Resume> = z.object({
  title: z.string(),
  name: z.string(),
  headline: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  avatar: avatarSchema.optional(),
  detail: collection(detailSchema),
  page: collection(pageSchema),
})
