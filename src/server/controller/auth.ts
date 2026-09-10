import type { GitHubProfile } from "@/server/auth/github"
import type { ApiResponse } from "@/server/model/api"
import type { MeResponse } from "@/server/model/dto/auth"
import { err, ok } from "@/server/api"
import { auth as authenticate } from "@/server/auth"
import { exchangeCode, fetchUser } from "@/server/auth/github"
import { signSession } from "@/server/auth/jwt"
import { repo } from "@/server/repo"
import { ErrorCode } from "@/shared/error-code"

export const auth = {
  /**
   * @description 调 GitHub 换 code, upsert user, 签 JWT
   */
  async githubCallback(code: string): Promise<ApiResponse<{ jwt: string }>> {
    let accessToken: string
    try {
      accessToken = await exchangeCode(code)
    }
    catch {
      return err(ErrorCode.Auth.Required, "GitHub 拒绝授权")
    }

    let profile: GitHubProfile
    try {
      profile = await fetchUser(accessToken)
    }
    catch {
      return err(ErrorCode.Auth.Required, "拉取 GitHub 用户失败")
    }

    let userEntity: Awaited<ReturnType<typeof repo.user.upsertFromGithub>>
    try {
      userEntity = await repo.user.upsertFromGithub(profile)
    }
    catch {
      return err(ErrorCode.System.Internal, "用户写入失败")
    }

    try {
      return ok({ jwt: await signSession(userEntity.id) })
    }
    catch {
      return err(ErrorCode.System.Internal, "JWT 签发失败")
    }
  },

  /**
   * @description 调 auth 拿 session, 查 user 返 MeResponse
   */
  async me(): Promise<ApiResponse<MeResponse>> {
    const authed = await authenticate()
    if (!authed.ok) {
      return err(authed.code, authed.msg)
    }
    const u = await repo.user.findById(authed.session.userId)
    if (!u) {
      return err(ErrorCode.System.Internal, "用户不存在")
    }
    return ok({ id: u.id, github: u.github, name: u.name, avatarUrl: null })
  },
}
