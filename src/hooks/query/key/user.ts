export const user = {
  /**
   * @description 用户域的全部缓存
   */
  all: ["user"] as const,

  /**
   * @description AI 与头像配额
   */
  quota: () => [...user.all, "quota"] as const,
}
