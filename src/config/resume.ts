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
  detail: {
    items: [
      { id: "1", icon: "", content: "湖南大学 | 人工智能" },
      { id: "2", icon: "", content: "https://www.twis.uk" },
      { id: "3", icon: "", content: "Code 1413h | 952k Lines" },
    ],
    orders: ["1", "2", "3"],
  },
  page: {
    items: [
      {
        id: "1",
        section: {
          items: [
            {
              id: "1",
              icon: "star",
              title: "个人优势",
              part: {
                items: [
                  {
                    id: "1",
                    title: "",
                    subtitle: "",
                    link: "",
                    date: "",
                    content: {
                      items: [
                        { id: "1", content: "- 熟练使用 **HTML5 + CSS3**, 熟悉 **JavaScript(ES6)** 语法和特性\n" },
                        { id: "2", content: "- 有非常丰富的 **React** 开发经验, 对 **UI=f(state)**, **函数式编程**和**状态管理**有深刻的理解\n" },
                        { id: "3", content: "- 熟悉使用 **Next.js** 等 **SSR** 框架和 **TanStack** 等前端工具链\n" },
                        { id: "4", content: "- 熟悉使用 **ESLint**, **Stylistic**, **Prettier** 等前端工程化工具和相关 **Git hooks**, **CI** 配置\n" },
                        { id: "5", content: "- 熟练使用 **Claude Code**, **Pi** 等 **Agent** 工具辅助开发\n" },
                        { id: "6", content: "- 具有丰富的业务经验和开源贡献能力, 学习速度快, 适应性强\n" },
                      ],
                      orders: ["1", "2", "3", "4", "5", "6"],
                    },
                  },
                ],
                orders: ["1"],
              },
            },
            {
              id: "2",
              icon: "briefcase",
              title: "工作经历",
              part: {
                items: [
                  {
                    id: "1",
                    title: "bilibili",
                    subtitle: "前端开发实习生",
                    link: "",
                    date: "2026.7 - 至今",
                    content: { items: [], orders: [] },
                  },
                ],
                orders: ["1"],
              },
            },
            {
              id: "3",
              icon: "settings",
              title: "项目经历",
              part: {
                items: [
                  {
                    id: "1",
                    title: "Resumic 简历制作器",
                    subtitle: "AI 驱动的在线简历制作器",
                    link: "https://resumic.twis.uk",
                    date: "2026.9 - 至今",
                    content: {
                      items: [
                        { id: "1", content: "基于 **Next.js 16**, **Vercel AI SDK v7** 的全栈简历制作器, 提供 AI 驱动和所见即所得的编辑体验\n" },
                        { id: "2", content: "- 基于 **React 19**, 使用 **shadcn** 组件库和 **Tailwind CSS** 的原子化样式方案\n" },
                        { id: "3", content: "- 使用 **markdown-it** 和 **html-react-parser** 手动实现既开发友好又 **XSS** 安全的富文本编辑器\n" },
                        { id: "4", content: "- ~~实现了完成的历史记录功能(开发中)~~\n" },
                        { id: "5", content: "- ~~提供了 Agent 功能, 实现了可配置的 AI 对接能力~~\n" },
                      ],
                      orders: ["1", "2", "3", "4", "5"],
                    },
                  },
                ],
                orders: ["1"],
              },
            },
            {
              id: "4",
              icon: "school",
              title: "教育背景",
              part: {
                items: [
                  {
                    id: "1",
                    title: "湖南大学",
                    subtitle: "人工智能专业, 大三在读",
                    link: "",
                    date: "2024 - 2028",
                    content: { items: [], orders: [] },
                  },
                ],
                orders: ["1"],
              },
            },
          ],
          orders: ["1", "2", "3", "4"],
        },
      },
    ],
    orders: ["1"],
  },
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
  detail: {
    items: [],
    orders: [],
  },
  page: {
    items: [],
    orders: [],
  },
}
