import type { AvatarEntity } from "@server/model/entity"
import { db } from "@server/db"

export const avatar = {
  /**
   * @description 按 userId 查头像槽位, 按 id desc 排序 (新的在前)
   */
  listByUserId(userId: number): Promise<AvatarEntity[]> {
    return db.orm.public.Avatar
      .where(a => a.userId.eq(userId))
      .orderBy(a => a.id.desc())
      .all()
      .toArray()
  },

  /**
   * @description 按 id 查 Avatar
   */
  findById(id: number): Promise<AvatarEntity | null> {
    return db.orm.public.Avatar.first({ id })
  },

  /**
   * @description 创建头像槽位记录
   */
  create(userId: number, url: string): Promise<AvatarEntity> {
    return db.orm.public.Avatar.create({ userId, url })
  },

  /**
   * @description 删除头像槽位 (按 id)
   */
  delete(id: number): Promise<AvatarEntity | null> {
    return db.orm.public.Avatar
      .where({ id })
      .delete()
  },
}
