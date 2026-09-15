import process from "node:process"
import { z } from "zod"

/**
 * @description CSV 字符串转 string[], 过滤空段
 */
function csvList(s: string) {
  return s.split(",").map(t => t.trim()).filter(Boolean)
}

const schema = z.object({
  /**
   * @description 数据库连接字符串, Prisma 用
   */
  DATABASE_URL: z.string().min(1),

  /**
   * @description 应用公网 URL, OAuth 回调用
   */
  APP_URL: z.url().default("http://localhost:3000"),

  GH_CLIENT: z.object({
    /**
     * @description GitHub OAuth client id
     */
    ID: z.string().min(1),

    /**
     * @description GitHub OAuth client secret
     */
    SECRET: z.string().min(1),
  }),

  SESSION: z.object({
    /**
     * @description session cookie 名, env 空时按 NODE_ENV 推 (dev 用 session, prod 用 __Host-session)
     */
    COOKIE_NAME: z.string().default(
      process.env.NODE_ENV === "production" ? "__Host-session" : "session",
    ),
  }),

  JWT: z.object({
    /**
     * @description JWT 签发与校验密钥, 至少 32 字符
     */
    SECRET: z.string().min(32, "JWT_SECRET 至少 32 字符"),

    /**
     * @description JWT 过期时间, 默认 7d
     */
    TTL: z.string().default("7d"),
  }),

  AI: z.object({
    /**
     * @description 用户自配 key 的 AES-256-GCM 加密密钥
     */
    KEY_ENCRYPTION_SECRET: z.string().min(1),

    /**
     * @description 每日免费 AI 调用上限
     */
    DAILY_LIMIT: z.coerce.number().int().positive().default(20),

    /**
     * @description 允许用户自配的模型白名单 (CSV), 空表示禁用自配
     */
    MODEL_ALLOWLIST: z.string().default("").transform(csvList),

    /**
     * @description 默认 OpenAI key, 走项目免费额度
     */
    DEFAULT_KEY: z.string().min(1),

    /**
     * @description 默认模型, provider:model 格式 (如 openai:gpt-4o-mini)
     */
    DEFAULT_MODEL: z.string().min(1),

    /**
     * @description OpenAI 兼容服务 base URL, 空走官方
     */
    OPENAI_BASE_URL: z.string().default(""),
  }),

  /**
   * @description 头像上传配额 (字节), 默认 50 MiB
   */
  AVATAR_QUOTA_BYTES: z.coerce.number().int().positive().default(52428800),
})

/**
 * @description 将 flat env var 重新组装为嵌套对象, 供 schema.parse 校验
 */
function nest(raw: NodeJS.ProcessEnv) {
  return {
    DATABASE_URL: raw.DATABASE_URL,
    APP_URL: raw.APP_URL,
    AVATAR_QUOTA_BYTES: raw.AVATAR_QUOTA_BYTES,
    GH_CLIENT: {
      ID: raw.GH_CLIENT_ID,
      SECRET: raw.GH_CLIENT_SECRET,
    },
    SESSION: {
      COOKIE_NAME: raw.SESSION_COOKIE_NAME,
    },
    JWT: {
      SECRET: raw.JWT_SECRET,
      TTL: raw.JWT_TTL,
    },
    AI: {
      KEY_ENCRYPTION_SECRET: raw.AI_KEY_ENCRYPTION_SECRET,
      DAILY_LIMIT: raw.AI_DAILY_LIMIT,
      DEFAULT_KEY: raw.AI_DEFAULT_KEY,
      DEFAULT_MODEL: raw.AI_DEFAULT_MODEL,
      MODEL_ALLOWLIST: raw.AI_MODEL_ALLOWLIST,
      OPENAI_BASE_URL: raw.AI_OPENAI_BASE_URL,
    },
  }
}

/**
 * @description 应用统一环境变量, 启动时一次性加载并校验
 */
export const ENV = schema.parse(nest(process.env))
