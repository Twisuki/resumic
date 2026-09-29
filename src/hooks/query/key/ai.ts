export const ai = {
  /**
   * @description AI 域的全部缓存
   */
  all: ["ai"] as const,

  configs: {
    /**
     * @description AI 配置列表 (含 active 派生标记)
     */
    all: () => [...ai.all, "config"] as const,
    list: () => [...ai.configs.all(), "list"] as const,
  },
}
