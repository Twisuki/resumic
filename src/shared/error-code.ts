export const ErrorCode = {
  OK: 0,
  Auth: {
    Required: 10001,
    Forbidden: 10002,
  },
  System: {
    Internal: 50001,
  },
} as const

export type ErrorCodeValue
  = | typeof ErrorCode.OK
    | (typeof ErrorCode.Auth)[keyof typeof ErrorCode.Auth]
    | (typeof ErrorCode.System)[keyof typeof ErrorCode.System]
