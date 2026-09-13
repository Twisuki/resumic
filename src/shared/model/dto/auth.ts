export interface GithubLoginRequest {
  next?: string
}

export interface GithubCallbackRequest {
  code: string
  state: string
}

export interface MeResponse {
  id: number
  github: string
  name: string
}
