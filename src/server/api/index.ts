import type { ErrorCodeValue } from "@shared/error-code"
import type { ApiErr, ApiOk } from "@shared/model"
import { ErrorCode } from "@shared/error-code"

export function ok<T>(data: T): ApiOk<T> {
  return { code: ErrorCode.OK, data, msg: "" }
}

export function err(code: Exclude<ErrorCodeValue, 0>, msg: string): ApiErr {
  return { code, data: null, msg }
}
