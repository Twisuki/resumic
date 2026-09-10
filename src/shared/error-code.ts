export const ErrorCode = {
  OK: 0,
  Auth: {
    Required: 10001,
  },
} as const

export type ErrorCodeValue
  = | typeof ErrorCode.OK
    | (typeof ErrorCode.Auth)[keyof typeof ErrorCode.Auth]
