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
  sections: [],
}
