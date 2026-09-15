import { ENV } from "@/config/env"

export interface GitHubProfile {
  login: string
  name: string | null
}

interface TokenResponse {
  access_token?: string
  error?: string
}

interface UserResponse {
  login: string
  name: string | null
}

/**
 * @description 用 GitHub OAuth code 换 access token
 */
export async function exchangeCode(code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      client_id: ENV.GH_CLIENT.ID,
      client_secret: ENV.GH_CLIENT.SECRET,
      code,
    }),
  })
  if (!res.ok) {
    throw new TypeError(`exchangeCode ${res.status}`)
  }
  const data = (await res.json()) as TokenResponse
  if (!data.access_token) {
    throw new TypeError(`exchangeCode missing token: ${data.error ?? "unknown"}`)
  }
  return data.access_token
}

/**
 * @description 用 access token 拉 GitHub 用户
 */
export async function fetchUser(accessToken: string): Promise<GitHubProfile> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "resumic",
    },
  })
  if (!res.ok) {
    throw new TypeError(`fetchUser ${res.status}`)
  }
  const data = (await res.json()) as UserResponse
  return { login: data.login, name: data.name }
}
