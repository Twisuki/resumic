import type { AvatarEntity } from "@server/model/entity"
import type { AvatarSlotResponse, ListAvatarsResponse } from "@shared/model"
import { blob } from "@server/blob"
import { repo } from "@server/repo"
import { ServiceError } from "@server/service/error"
import { ErrorCode } from "@shared/error-code"
import { AVATAR_CONTENT_TYPES, AVATAR_MAX_BYTES, AVATAR_MAX_SLOTS } from "@/config/avatar"
import { genId } from "@/lib/id"

/**
 * @description 头像 Blob 的 pathname (不落库, 由 userId + token 现推)
 */
function pathnameOf(userId: number, token: string): string {
  return `avatars/${userId}/${token}`
}

/**
 * @description 由公网 URL 反推 Blob pathname, 供覆盖用
 */
function pathnameFromUrl(url: string): string {
  return new URL(url).pathname.replace(/^\//, "")
}

/**
 * @description 校验上传文件的类型与大小
 */
function assertUploadable(file: File): void {
  if (!AVATAR_CONTENT_TYPES.includes(file.type)) {
    throw new ServiceError(ErrorCode.Avatar.UnsupportedType, "仅支持 png / jpeg / webp")
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new ServiceError(ErrorCode.Avatar.TooLarge, "头像不能超过 1MB")
  }
}

/**
 * @description 按 id 取本人槽位, 不存在或不属于本人时抛 NotFound
 */
async function mustOwn(userId: number, id: number): Promise<AvatarEntity> {
  const entity = await repo.avatar.findById(id)
  if (!entity || entity.userId !== userId) {
    throw new ServiceError(ErrorCode.Avatar.NotFound, "头像不存在")
  }
  return entity
}

/**
 * @description 槽位实体转响应
 */
function toResponse(entity: AvatarEntity): AvatarSlotResponse {
  return { id: entity.id, url: entity.url }
}

export const avatar = {
  /**
   * @description 列当前用户的头像槽位
   */
  async list(userId: number): Promise<ListAvatarsResponse> {
    const rows = await repo.avatar.listByUserId(userId)
    return rows.map(toResponse)
  },

  /**
   * @description 上传新槽位: 校验类型/大小 -> 限槽 -> 存 Blob -> 落库
   */
  async create(userId: number, file: File): Promise<AvatarSlotResponse> {
    assertUploadable(file)

    const rows = await repo.avatar.listByUserId(userId)
    if (rows.length >= AVATAR_MAX_SLOTS) {
      throw new ServiceError(ErrorCode.Avatar.TooMany, `最多 ${AVATAR_MAX_SLOTS} 个头像槽位`)
    }

    const url = await blob.put(pathnameOf(userId, genId()), file)
    const entity = await repo.avatar.create(userId, url)
    return toResponse(entity)
  },

  /**
   * @description 覆盖槽位文件 (url 不变): 校验 -> 归属 -> 覆盖 Blob
   */
  async replace(userId: number, id: number, file: File): Promise<AvatarSlotResponse> {
    assertUploadable(file)

    const entity = await mustOwn(userId, id)
    await blob.put(pathnameFromUrl(entity.url), file, true)
    return toResponse(entity)
  },

  /**
   * @description 删除槽位: 归属校验 -> 删 Blob -> 删记录
   */
  async remove(userId: number, id: number): Promise<void> {
    const entity = await mustOwn(userId, id)
    await blob.delete(entity.url)
    await repo.avatar.delete(id)
  },
}
