import { ai } from "@server/controller/ai"
import { auth } from "@server/controller/auth"
import { health } from "@server/controller/health"
import { resume } from "@server/controller/resume"
import { user } from "@server/controller/user"

export const controller = { ai, auth, health, resume, user }
