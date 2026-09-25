/**
 * @description 单个头像文件大小上限 (1MB)
 */
export const AVATAR_MAX_BYTES = 1024 * 1024

/**
 * @description 每用户头像槽位上限
 */
export const AVATAR_MAX_SLOTS = 10

/**
 * @description 允许上传的头像 MIME 白名单
 */
export const AVATAR_CONTENT_TYPES: readonly string[] = ["image/png", "image/jpeg", "image/webp"]
