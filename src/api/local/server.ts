import { ai } from "@/api/local/ai"
import { credentials } from "@/api/local/credentials"
import { resume } from "@/api/local/resume"
import { storage } from "@/api/local/storage"

export type { LocalState } from "@/api/local/model"
export { LOCAL_STATE_KEY } from "@/api/local/storage"

/** @description 本地假后端统一入口 */
export const localServer = {
  storage,
  resume,
  ai,
  credentials,
}
