import { Buffer } from "node:buffer"
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import { ENV } from "@/config/env"

const ALGO = "aes-256-gcm"
const KEY_LEN = 32
const IV_LEN = 12
const TAG_LEN = 16

function getKey(): Buffer {
  const key = Buffer.from(ENV.AI.KEY_ENCRYPTION_SECRET, "base64")
  if (key.length !== KEY_LEN) {
    throw new Error(`AI_KEY_ENCRYPTION_SECRET must decode to ${KEY_LEN} bytes (base64 of 32 random bytes)`)
  }
  return key
}

/**
 * @description AES-256-GCM 加密, 返 base64 (iv + tag + ciphertext)
 */
export function encryptKey(plaintext: string): string {
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ciphertext]).toString("base64")
}

/**
 * @description AES-256-GCM 解密, 入参 base64 (iv + tag + ciphertext)
 */
export function decryptKey(encoded: string): string {
  const buf = Buffer.from(encoded, "base64")
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const ciphertext = buf.subarray(IV_LEN + TAG_LEN)
  const decipher = createDecipheriv(ALGO, getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")
}
