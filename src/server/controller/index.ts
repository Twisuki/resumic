import { auth } from "@server/controller/auth"
import { avatar } from "@server/controller/avatar"
import { health } from "@server/controller/health"
import { resume } from "@server/controller/resume"

export const controller = { auth, avatar, health, resume }
