export const ErrorCode = {
  OK: 0,
  Auth: {
    Required: 10001,
    Forbidden: 10002,
  },
  Resume: {
    NotFound: 30001,
  },
  System: {
    Internal: 90001,
  },
} as const

export type ErrorCodeValue
  = | typeof ErrorCode.OK
    | (typeof ErrorCode.Auth)[keyof typeof ErrorCode.Auth]
    | (typeof ErrorCode.Resume)[keyof typeof ErrorCode.Resume]
    | (typeof ErrorCode.System)[keyof typeof ErrorCode.System]
