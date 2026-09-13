export const resume = {
  /**
   * @description 简历域的全部缓存
   */
  all: ["resume"] as const,

  /**
   * @description 简历摘要列表
   */
  lists: () => [...resume.all, "list"] as const,

  /**
   * @description 单份简历
   */
  detail: (id: number) => [...resume.all, "detail", id] as const,
}
