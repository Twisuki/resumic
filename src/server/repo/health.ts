import { db } from "@server/db"

export const health = {
  /**
   * @description 探活 DB, 返 true 表示连得上
   */
  async probe(): Promise<boolean> {
    try {
      await db.orm.public.User.first({ id: -1 })
      return true
    }
    catch {
      return false
    }
  },
}
