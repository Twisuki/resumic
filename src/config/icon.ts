/**
 * @description 简历可选图标的分组清单
 */
export const ICON_GROUPS = [
  {
    type: "联系与个人信息",
    icons: ["phone", "mail", "map-pin", "home", "cake", "calendar", "user", "id-badge", "world", "link", "brand-github", "brand-linkedin"],
  },
  {
    type: "教育 / 学业",
    icons: ["school", "book", "notebook", "certificate", "backpack", "microscope", "language", "vocabulary"],
  },
  {
    type: "工作 / 项目",
    icons: ["briefcase", "building", "hierarchy", "users-group", "target", "rocket", "calendar-event", "chart-bar"],
  },
  {
    type: "技能 / 技术",
    icons: ["code", "terminal", "database", "server", "cloud", "device-laptop", "cpu", "robot", "brain", "palette", "camera", "tool"],
  },
  {
    type: "荣誉 / 成果",
    icons: ["trophy", "medal", "award", "star", "sparkles", "bulb", "puzzle"],
  },
  {
    type: "通用 / 其他",
    icons: ["heart", "compass", "flag"],
  },
] as const

/**
 * @description 全部合法图标名的扁平并集
 */
export type IconName = (typeof ICON_GROUPS)[number]["icons"][number]
