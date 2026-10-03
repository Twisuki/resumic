export const avatar = {
  /**
   * @description 头像域的全部缓存
   */
  all: ["avatar"] as const,

  /**
   * @description 当前用户的头像槽位列表
   */
  lists: () => [...avatar.all, "list"] as const,
}
