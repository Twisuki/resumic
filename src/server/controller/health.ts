import type { HealthResponse } from "@shared/model"
import { service } from "@server/service"

export const health = {
  /**
   * @description 调 service 探 DB, 组装 hello / ok / db 返回
   */
  async check(): Promise<HealthResponse> {
    const db = await service.health.checkDb()
    return {
      hello: "world",
      ok: db === "up",
      db,
    }
  },
}
