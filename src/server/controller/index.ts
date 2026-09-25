import { ai } from "@server/controller/ai"
import { auth } from "@server/controller/auth"
import { avatar } from "@server/controller/avatar"
import { health } from "@server/controller/health"
import { resume } from "@server/controller/resume"
import { user } from "@server/controller/user"

export const controller = { ai, auth, avatar, health, resume, user }
