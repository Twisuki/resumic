import { ai } from "@server/controller/ai"
import { aiConfig } from "@server/controller/ai-config"
import { auth } from "@server/controller/auth"
import { avatar } from "@server/controller/avatar"
import { health } from "@server/controller/health"
import { resume } from "@server/controller/resume"

export const controller = { ai, aiConfig, auth, avatar, health, resume }
