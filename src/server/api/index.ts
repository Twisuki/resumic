import type { ApiErr, ApiOk } from "@/server/model/api"

export function ok<T>(data: T): ApiOk<T> {
  return { code: 0, data, msg: "" }
}

export function err(code: string, msg: string): ApiErr {
  return { code, data: null, msg }
}
