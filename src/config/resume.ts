import type { Resume } from "@shared/model"

/**
 * @description 默认简历模板
 */
export const DEFAULT_RESUME: Resume = {
  title: "默认简历",
  name: "苏阳",
  headline: "Hi, this is Twisuki",
  age: "20岁",
  gender: "unknown",
  phone: "1xxxxxxxxxx",
  email: "hi@twis.uk",
  details: [
    { icon: "", content: "湖南大学 | 人工智能" },
    { icon: "", content: "https://www.twis.uk" },
    { icon: "", content: "Code 1413h | 952k Lines" },
  ],
  sections: [
    {
      type: "",
      icon: "",
      title: "项目经历",
      parts: [
        {
          title: "Resumic 简历编辑器",
          subtitle: "AI 驱动的在线简历编辑器",
          link: "https://github.com/Twisuki/resumic",
          date: "2026.9",
          content: {
            lines: [
              { id: "1", content: "- 技术栈: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Prisma\n" },
              { id: "2", content: "- 预设固定简历排版, 用户填空即用; 简历以 JSON 整块落库, 富文本块走自研 markdown 解析\n" },
              { id: "3", content: "- 集成 AI 助手: 以 tool calling 暴露读/改简历能力, 改动先返回 patch 描述, 前端确认后落库\n" },
            ],
            orders: ["1", "2", "3"],
          },
        },
      ],
    },
  ],
}
