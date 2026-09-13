import { ai } from "@server/service/ai"
import { health } from "@server/service/health"
import { resume } from "@server/service/resume"
import { user } from "@server/service/user"

export const service = { ai, health, resume, user }
export { ServiceError } from "@server/service/error"
