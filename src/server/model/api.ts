export interface ApiOk<T> {
  code: 0
  data: T
  msg: ""
}

export interface ApiErr {
  code: string
  data: null
  msg: string
}

export type ApiResponse<T> = ApiOk<T> | ApiErr
