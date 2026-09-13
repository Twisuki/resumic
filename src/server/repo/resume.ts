import type { ResumeEntity } from "@server/model/entity"
import type { Resume } from "@shared/model"
import { db } from "@server/db"

export const resume = {
  /**
   * @description 按 userId 查简历, 按 updatedAt desc 排序
   */
  listByUserId(userId: number): Promise<ResumeEntity[]> {
    return db.orm.public.Resume
      .where(r => r.userId.eq(userId))
      .orderBy(r => r.updatedAt.desc())
      .all()
      .toArray()
  },

  /**
   * @description 按 id 查 Resume
   */
  findById(id: number): Promise<ResumeEntity | null> {
    return db.orm.public.Resume.first({ id })
  },

  /**
   * @description 创建简历记录
   */
  create(userId: number, data: Resume): Promise<ResumeEntity> {
    return db.orm.public.Resume.create({
      userId,
      data: data as never,
    })
  },

  /**
   * @description 更新 Resume 的 data 字段 (按 id)
   */
  update(id: number, data: Resume): Promise<ResumeEntity | null> {
    return db.orm.public.Resume
      .where({ id })
      .update({ data: data as never })
  },

  /**
   * @description 删除 Resume (按 id)
   */
  delete(id: number): Promise<ResumeEntity | null> {
    return db.orm.public.Resume
      .where({ id })
      .delete()
  },
}
