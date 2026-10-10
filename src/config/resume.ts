import type { Resume } from "@shared/model"

/**
 * @description 默认简历模板
 */
export const DEFAULT_RESUME: Resume = {
  title: "默认简历",
  zoom: 0.85,
  name: "苏阳",
  headline: "前端 / 全栈开发",
  age: "20岁",
  gender: "unknown",
  phone: "1xx-xxxx-xxxx",
  email: "hi@twis.uk",
  avatar: "https://6bqteeh4w7gvprdc.public.blob.vercel-storage.com/avatars/4/gmzCPsdCk1Ff",
  detail: [
    { icon: "school", content: "湖南大学 | 人工智能" },
    { icon: "home", content: "https://www.twis.uk" },
    { icon: "code", content: "Code 1505h | 1.09M Lines" },
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
                "- 熟练掌握 **HTML / CSS / JavaScript** 及 **React / Vue**, 熟悉响应式原理与状态管理\n"
                + "- 熟练使用 **Next** / **Vite** 构建站点, 熟悉 **Tanstack Query** / **tRPC** 等一系列前端工具链\n"
                + "- 主导过多个 **Web 应用, 小程序** 与 **代码库** 的完整开发, 工程经验丰富\n"
                + "- 熟悉 **AI Agent** 工具链, 在快速开发的情况下也有经验保持项目的高质量",
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
        {
          icon: "briefcase",
          title: "工作经历",
          part: [
            {
              title: "上海幻电信息科技 (bilibili)",
              subtitle: "前端开发实习生",
              link: "",
              date: "2026.7 - 2026.10",
              content:
                "负责 **某音频平台 Web / H5 端** 夏季活动期间 **5** 个核心活动页面的前端开发与迭代, 配合赛事节奏按时按质交付\n"
                + "- 针对动态版图在多端表现差异, 设计 **6 层降级策略**, 保证弱网 / 低版本环境下页面仍可正常展示与交互\n"
                + "- 在状态复杂, 交互密集的活动页面引入 **reducer 状态机**, 替代散落的本地状态, 显著降低后续维护与扩展成本",
            },
          ],
        },
        {
          icon: "rocket",
          title: "项目经历",
          part: [
            {
              title: "Resumic 简历制作器",
              subtitle: "AI 驱动的在线简历制作器",
              link: "https://resumic.twis.uk",
              date: "2026.9 - 至今",
              content:
                "基于 **Next** 和 **Prisma** 的全栈简历编辑器, 使用 **Vercel AI SDK** 提供了 AI 能力, 本简历就是使用此编辑器编写的\n"
                + "- 使用 **markdown-it** 和 **html-react-parser** 实现了既开发友好又 **XSS** 安全的富文本编辑器\n"
                + "- 专门设计了 **节点树与哈希表结构**, 实现高性能的 **增量 Patch** 与 **历史记录** 能力\n"
                + "- 实现小型 **Agent**, 提供 **AI 驱动** 的简历编辑能力",
            },
            {
              title: "湖南大学微生活小程序",
              subtitle: "湖南大学本科学生的一站式信息获取平台",
              link: "https://github.com/qnxg/weihuda_weapp_tsumiki",
              date: "2026.4 - 2026.10",
              content:
                "前端基于 **Taro**, 后端基于 **Rust** 的微信小程序, 日均访问 **1.3w**, 累计用户 **10w+**, 我主导了整个新版本重构工作\n"
                + "- 设计统一的 **请求模型** 与 **Taro** 兼容的 **Query 风格** 的请求 Hook, 并沉淀通用 **组件库** 与**样式方案**\n"
                + "- 搭建支撑 **复杂状态共享** 的底层机制, 为各业务模块提供统一开发基底\n"
                + "- 主导设计了 **RESTful** 风格的 API 接口, 并将一些基础设施抽象成独立的库",
            },
            {
              title: "oh 系列开源工具库",
              subtitle: "一组 TypeScript 开源工具库",
              link: "https://x.twis.uk/zh",
              date: "持续更新",
              content:
                "我在开发中遇到的问题与产生的思路, 整理成了本系列库\n"
                + "- **@xtwis/ohday** - 对标 dayjs 的链式, 不可变日期时间库, 在相近的打包体积下提供更强的解析与计算能力\n"
                + "- **@xtwis/ohnet** - 面向业务的请求客户端, 内置洋葱模型的中间件管线与统一的错误体系\n"
                + "- **@xtwis/ohdoc** - 轻量的本地文档脚手架, 一条命令启动 VitePress 文档站点",
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
