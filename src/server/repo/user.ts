import type { UserEntity } from "@/server/model/entity"
import { db } from "@/server/db"

export const user = {
  /**
   * @description 按 id 查 User
   */
  findById(id: number): Promise<UserEntity | null> {
    return db.orm.public.User.first({ id })
  },

  /**
   * @description 按 github login 查 User
   */
  findByGithub(github: string): Promise<UserEntity | null> {
    return db.orm.public.User.first({ github })
  },

  /**
   * @description 按 GitHub profile upsert User, name 变化时同步
   */
  async upsertFromGithub(profile: { login: string, name: string | null }): Promise<UserEntity> {
    const name = profile.name ?? profile.login
    const existing = await this.findByGithub(profile.login)
    if (existing) {
      if (existing.name === name)
        return existing
      return (await db.orm.public.User
        .where({ id: existing.id })
        .update({ name })) ?? existing
    }
    return await db.orm.public.User.create({
      github: profile.login,
      name,
    })
  },

  /**
   * @description 设置 user 自配 AI key (已加密) + model
   */
  setAiKey(id: number, encryptedKey: string, model: string): Promise<UserEntity | null> {
    return db.orm.public.User
      .where({ id })
      .update({ aiKey: encryptedKey, aiModel: model })
  },

  /**
   * @description 清除 user 自配 AI key + model
   */
  clearAiKey(id: number): Promise<UserEntity | null> {
    return db.orm.public.User
      .where({ id })
      .update({ aiKey: null, aiModel: null })
  },
}
