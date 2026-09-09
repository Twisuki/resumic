export interface Session {
  userId: number
  github: string
  name: string
  status: "active" | "disabled"
}

export async function auth(): Promise<Session> {
  throw new Error("auth() not implemented")
}

export async function authOrNull(): Promise<Session | null> {
  throw new Error("authOrNull() not implemented")
}
