import type { ErrorCodeFailure } from "@/shared/error-code"

export class ServiceError extends Error {
  constructor(
    public code: ErrorCodeFailure,
    public msg: string,
  ) {
    super(msg)
  }
}
