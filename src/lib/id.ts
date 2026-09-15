import { nanoid } from "nanoid"

export function genId(): string {
  return nanoid(12)
}
