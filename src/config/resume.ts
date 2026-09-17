import type { Resume } from "@shared/model"

/**
 * @description 默认简历模板
 */
export const DEFAULT_RESUME: Resume = {
  title: "默认简历",
  zoom: 1,
  name: "苏阳",
  headline: "Hi, this is Twisuki",
  age: "20岁",
  gender: "unknown",
  phone: "1xxxxxxxxxx",
  email: "hi@twis.uk",
  detail: [
    { icon: "school", content: "湖南大学 | 人工智能" },
    { icon: "home", content: "https://www.twis.uk" },
    { icon: "code", content: "Code 1413h | 952k Lines" },
  ],
  page: [
    {
      section: [
        {
          icon: "star",
          title: "个人优势",
          part: [
            {
              title: "",
              subtitle: "",
              link: "",
              date: "",
              content:
                "- 熟练使用 **HTML5 + CSS3**, 熟悉 **JavaScript(ES6)** 语法和特性\n"
                + "- 有非常丰富的 **React** 开发经验, 对 **UI=f(state)**, **函数式编程**和**状态管理**有深刻的理解\n"
                + "- 熟悉使用 **Next.js** 等 **SSR** 框架和 **TanStack** 等前端工具链\n"
                + "- 熟悉使用 **ESLint**, **Stylistic**, **Prettier** 等前端工程化工具和相关 **Git hooks**, **CI** 配置\n"
                + "- 熟练使用 **Claude Code**, **Pi** 等 **Agent** 工具辅助开发\n"
                + "- 具有丰富的业务经验和开源贡献能力, 学习速度快, 适应性强\n",
            },
          ],
        },
        {
          icon: "briefcase",
          title: "工作经历",
          part: [
            {
              title: "bilibili",
              subtitle: "前端开发实习生",
              link: "",
              date: "2026.7 - 至今",
              content: "",
            },
          ],
        },
        {
          icon: "settings",
          title: "项目经历",
          part: [
            {
              title: "Resumic 简历制作器",
              subtitle: "AI 驱动的在线简历制作器",
              link: "https://resumic.twis.uk",
              date: "2026.9 - 至今",
              content:
                "基于 **Next.js 16**, **Vercel AI SDK v7** 的全栈简历制作器, 提供 AI 驱动和所见即所得的编辑体验\n"
                + "- 基于 **React 19**, 使用 **shadcn** 组件库和 **Tailwind CSS** 的原子化样式方案\n"
                + "- 使用 **markdown-it** 和 **html-react-parser** 手动实现既开发友好又 **XSS** 安全的富文本编辑器\n"
                + "- 自研 **Patch** 和有序 **Collection** 数据结构, 实现高性能历史记录能力\n"
                + "- ~~提供了 Agent 功能, 实现了可配置的 AI 对接能力~~\n",
            },
          ],
        },
        {
          icon: "school",
          title: "教育背景",
          part: [
            {
              title: "湖南大学",
              subtitle: "人工智能专业, 大三在读",
              link: "",
              date: "2024 - 2028",
              content: "",
            },
          ],
        },
      ],
    },
  ],
}

/**
 * @description 空白简历模板
 */
export const EMPTY_RESUME: Resume = {
  title: "空白简历",
  zoom: 1,
  name: "",
  headline: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  detail: [],
  page: [],
}
