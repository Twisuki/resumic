import { resumeSchema } from "@shared/schema/resume"
import { z } from "zod"

/** @description 正整数简历 ID 与版本化本地快照校验 */
export const idSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
const timestampSchema = z.iso.datetime({ offset: true })

const storedResumeSchema = z.strictObject({
  id: idSchema,
  data: resumeSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

const storedAiConfigSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string().min(1),
  apiStyle: z.enum(["openai", "anthropic"]),
  baseUrl: z.url(),
  model: z.string().min(1),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  persistKey: z.boolean(),
  key: z.string().min(1).optional(),
})

export const localStateSchema = z.strictObject({
  version: z.literal(1),
  resume: storedResumeSchema.nullable(),
  nextResumeId: idSchema,
  aiConfigs: z.array(storedAiConfigSchema),
  activeAiConfigId: z.string().min(1).nullable(),
}).superRefine((state, ctx) => {
  if (state.resume && state.resume.id >= state.nextResumeId) {
    ctx.addIssue({ code: "custom", path: ["nextResumeId"], message: "简历 ID 序列无效" })
  }

  const ids = new Set<string>()
  const labels = new Set<string>()
  state.aiConfigs.forEach((config, index) => {
    if (ids.has(config.id) || labels.has(config.label)) {
      ctx.addIssue({ code: "custom", path: ["aiConfigs", index], message: "AI 配置重复" })
    }
    if (config.key !== undefined && !config.persistKey) {
      ctx.addIssue({ code: "custom", path: ["aiConfigs", index, "key"], message: "未允许保存 API key" })
    }
    ids.add(config.id)
    labels.add(config.label)
  })
  if (state.activeAiConfigId !== null && !ids.has(state.activeAiConfigId)) {
    ctx.addIssue({ code: "custom", path: ["activeAiConfigId"], message: "激活的 AI 配置不存在" })
  }
})

export type LocalState = z.infer<typeof localStateSchema>
export type StoredResume = z.infer<typeof storedResumeSchema>
export type StoredAiConfig = z.infer<typeof storedAiConfigSchema>

/** @description 创建无业务数据的独立快照 */
export function emptyState(): LocalState {
  return {
    version: 1,
    resume: null,
    nextResumeId: 1,
    aiConfigs: [],
    activeAiConfigId: null,
  }
}
