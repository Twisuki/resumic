import process from "node:process"
import { z } from "zod"

const schema = z.object({
  /**
   * @description 当前运行环境, dev 拼裸 cookie 名, prod 拼 __Host- 前缀
   */
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /**
   * @description 数据库连接字符串, Prisma 用
   */
  DATABASE_URL: z.string().min(1),

  /**
   * @description 应用公网 URL, OAuth 回调用
   */
  APP_URL: z.url().default("http://localhost:3000"),

  /**
   * @description Vercel Blob 读写 token, 头像上传用
   */
  BLOB_READ_WRITE_TOKEN: z.string().min(1),

  /**
   * @description 头像上传单文件大小上限 (字节)
   */
  AVATAR_QUOTA_BYTES: z.coerce.number().int().positive().default(52428800),

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
     * @description session cookie 后缀名, 未设时走默认 "session"; prod 调用层会拼 __Host- 前缀
     */
    COOKIE_NAME: z.string().default("session"),
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
  }),
})

/**
 * @description 将 flat env var 重新组装为嵌套对象, 供 schema.parse 校验
 */
function nest(raw: NodeJS.ProcessEnv) {
  return {
    NODE_ENV: raw.NODE_ENV,
    DATABASE_URL: raw.DATABASE_URL,
    APP_URL: raw.APP_URL,
    BLOB_READ_WRITE_TOKEN: raw.BLOB_READ_WRITE_TOKEN,
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
    },
  }
}

/**
 * @description 应用统一环境变量, 启动时一次性加载并校验
 */
export const ENV = schema.parse(nest(process.env))
