export interface GitHubProfile {
  login: string
  name: string | null
}

/**
 * @description 占位: 用 GitHub 授权 code 换 access token, 下一轮实施
 */
export async function exchangeCode(_code: string): Promise<string> {
  throw new Error("exchangeCode not implemented")
}

/**
 * @description 占位: 用 access token 拉 GitHub 用户, 下一轮实施
 */
export async function fetchUser(_token: string): Promise<GitHubProfile> {
  throw new Error("fetchUser not implemented")
}
