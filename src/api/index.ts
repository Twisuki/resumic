import { auth } from "@/api/auth"
import { resume } from "@/api/resume"
import { user } from "@/api/user"

/**
 * @description 前端 API 汇总, 按 app/api 的 route 分类
 */
export const api = { auth, resume, user }
