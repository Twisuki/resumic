type LeafCodes<T> = T extends number
  ? T
  : T extends Record<string, number>
    ? T[keyof T]
    : never

export type ErrorCodeValue = LeafCodes<typeof ErrorCode[keyof typeof ErrorCode]>

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
