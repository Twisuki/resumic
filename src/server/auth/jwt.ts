import { jwtVerify, SignJWT } from "jose"
import { ENV } from "@/config/env"

function key(): Uint8Array {
  return new TextEncoder().encode(ENV.JWT.SECRET)
}

/**
 * @description HS256 签发含 userId 的 JWT
 */
export async function signSession(userId: number): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ENV.JWT.TTL)
    .sign(key())
}

/**
 * @description HS256 验签 JWT, 返 userId
 */
export async function verifySession(token: string): Promise<{ userId: number }> {
  const { payload } = await jwtVerify(token, key())
  if (typeof payload.userId !== "number") {
    throw new TypeError("invalid payload")
  }
  return { userId: payload.userId }
}
