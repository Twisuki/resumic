import type { ResumeEntity } from "@/server/model/entity"
import type { Resume } from "@/server/model/resume"
import { db } from "@/server/db"

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
   * @description 插入简历记录
   */
  create(userId: number, data: Resume): Promise<ResumeEntity> {
    return db.orm.public.Resume.create({
      userId,
      data: data as never,
    })
  },
}
