import type { Resume } from "@shared/model/resume"
import { z } from "zod"

const avatarSchema = z.object({
  url: z.string(),
  uploadedAt: z.string(),
})

const detailSchema = z.object({
  icon: z.string(),
  content: z.string(),
})

const partSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  link: z.string(),
  date: z.string(),
  content: z.string(),
})

const sectionSchema = z.object({
  icon: z.string(),
  title: z.string(),
  part: z.array(partSchema),
})

const pageSchema = z.object({
  section: z.array(sectionSchema),
})

/**
 * @description Resume 的 schema (纯数组形态)
 * @see Resume
 */
export const resumeSchema: z.ZodType<Resume> = z.object({
  title: z.string(),
  zoom: z.number(),
  name: z.string(),
  headline: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  avatar: avatarSchema.optional(),
  detail: z.array(detailSchema),
  page: z.array(pageSchema),
})
