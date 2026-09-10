import type { ErrorCodeValue } from "@/shared/error-code"

export interface ApiOk<T> {
  code: 0
  data: T
  msg: ""
}

export interface ApiErr {
  code: Exclude<ErrorCodeValue, 0>
  data: null
  msg: string
}

export type ApiResponse<T> = ApiOk<T> | ApiErr
