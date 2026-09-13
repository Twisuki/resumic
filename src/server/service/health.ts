import { repo } from "@server/repo"

export const health = {
  /**
   * @description 检查 DB 连通性, 返 up / down
   */
  async checkDb(): Promise<"up" | "down"> {
    const up = await repo.health.probe()
    return up ? "up" : "down"
  },
}
