import { ai } from "@server/service/ai"
import { aiConfig } from "@server/service/ai-config"
import { avatar } from "@server/service/avatar"
import { health } from "@server/service/health"
import { resume } from "@server/service/resume"

export const service = { ai, aiConfig, avatar, health, resume }
export { ServiceError } from "@server/service/error"
