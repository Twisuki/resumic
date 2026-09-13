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
              { id: "1", content: "- 技术栈: **Next.js 16** + **React 19** + **TypeScript** + **Tailwind CSS 4** + **Prisma**\n" },
              { id: "2", content: "- 预设一套固定简历排版, 用户填空即用; 简历以 JSON 整块落库, 富文本块走 <color=#7c3aed>自研 markdown 渲染链路</color>\n" },
              { id: "3", content: "- 富文本支持**加粗**, *斜体*, `行内代码`, 以及 <color=#0a84ff>自定义颜色</color> 与 <size=1.2>自定义字号</size> 两条自研行内语法\n" },
              { id: "4", content: "- 内置 AI 助手: 以 `tool calling` 暴露读 / 改简历能力, 改动先返回 **patch 描述**, 用户确认后才落库\n" },
              { id: "5", content: "- 鉴权走 **GitHub OAuth** + `jose` 签发的 http-only cookie, 无中间件, 按需 `auth()`\n" },
            ],
            orders: ["1", "2", "3", "4", "5"],
          },
        },
      ],
    },
    {
      type: "",
      icon: "",
      title: "富文本能力演示",
      parts: [
        {
          title: "行内样式",
          subtitle: "加粗 / 斜体 / 行内代码 / 自定义颜色 / 自定义字号",
          link: "",
          date: "",
          content: {
            lines: [
              { id: "1", content: "普通文本, **粗体**, *斜体*, `行内代码`\n" },
              { id: "2", content: "\n" },
              { id: "3", content: "自定义颜色: <color=red>红</color> / <color=#0a84ff>蓝</color> / <color=rgb(22, 163, 74)>绿</color>\n" },
              { id: "4", content: "\n" },
              { id: "5", content: "自定义字号: <size=0.8>小</size> / 正常 / <size=1.5>大</size> / <size=2.5>更大</size>\n" },
              { id: "6", content: "\n" },
              { id: "7", content: "组合嵌套: <color=#7c3aed>紫色<size=1.4>又大又紫</size></color>\n" },
            ],
            orders: ["1", "2", "3", "4", "5", "6", "7"],
          },
        },
        {
          title: "块级结构",
          subtitle: "标题 / 引用 / 有序列表 / 嵌套列表 / 分割线",
          link: "",
          date: "",
          content: {
            lines: [
              { id: "1", content: "## 二级标题会被降级为加粗段落\n" },
              { id: "2", content: "\n" },
              { id: "3", content: "> 引用块: 简历里也可以放一句自述\n" },
              { id: "4", content: "\n" },
              { id: "5", content: "1. 有序列表第一项\n" },
              { id: "6", content: "2. 有序列表第二项\n" },
              { id: "7", content: "   - 嵌套的无序项\n" },
              { id: "8", content: "\n" },
              { id: "9", content: "---\n" },
              { id: "10", content: "\n" },
              { id: "11", content: "分割线之上与之下\n" },
            ],
            orders: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
          },
        },
        {
          title: "链接与安全降级",
          subtitle: "合法链接放行, 危险内容退化为纯文本",
          link: "",
          date: "",
          content: {
            lines: [
              { id: "1", content: "正常外链: [Twisuki 的主页](https://twis.uk)\n" },
              { id: "2", content: "\n" },
              { id: "3", content: "`javascript:` 协议会被拦下, 输出字面: [坏链接](javascript:alert(1))\n" },
              { id: "4", content: "\n" },
              { id: "5", content: "危险标签转义或丢弃: <script>alert(1)</script> <img src=x onerror=alert(1)> <iframe src=javascript:alert(1)></iframe>\n" },
              { id: "6", content: "\n" },
              { id: "7", content: "非法颜色退化为字面文本: <color=red;position:fixed>注入</color>\n" },
              { id: "8", content: "\n" },
              { id: "9", content: "越界字号退化为字面文本: <size=99>撑爆</size> <size=0.4>看不见</size>\n" },
            ],
            orders: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
          },
        },
      ],
    },
  ],
}
