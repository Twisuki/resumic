import process from "node:process"
import { jwtVerify, SignJWT } from "jose"

function key(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret)
    throw new Error("JWT_SECRET not set")
  return new TextEncoder().encode(secret)
}

/**
 * @description HS256 签发含 userId 的 JWT
 */
export async function signSession(userId: number): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_TTL ?? "7d")
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
