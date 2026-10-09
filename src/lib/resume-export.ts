import type { Resume } from "@shared/model"
import { resumeSchema } from "@shared/schema/resume"

/**
 * @description 把字符串清洗成可作为文件名的 slug
 * 替换路径分隔符与 Windows 非法字符, 控制最大长度
 */
export function sanitizeFilename(name: string): string {
  const trimmed = name.trim() || "resume"
  // eslint-disable-next-line no-control-regex -- 主动剔除控制字符, 避免写入文件名
  return trimmed.replace(/[\\/:*?"<>|\x00-\x1F]/g, "_").slice(0, 100)
}

/**
 * @description 把 Resume 序列化为 JSON 字符串, 与 import-dialog 接受的格式一致 (无 id/timestamp 包装)
 */
export function serializeResumeToJson(resume: Resume): string {
  return JSON.stringify(resume, null, 2)
}

/**
 * @description 解析 JSON 字符串并按 Resume schema 校验, 失败抛错
 */
export function parseResumeJson(json: string): Resume {
  let data: unknown
  try {
    data = JSON.parse(json)
  }
  catch {
    throw new Error("文件不是合法的 JSON")
  }
  const result = resumeSchema.safeParse(data)
  if (!result.success) {
    throw new Error("简历结构不符合要求")
  }
  return result.data
}

/**
 * @description 触发浏览器下载, 把 Resume 写成 JSON 文件
 */
export function downloadResumeJson(resume: Resume, filename: string): void {
  const blob = new Blob([serializeResumeToJson(resume)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * @description 给复制出的简历标题加后缀
 */
export function withCopySuffix(title: string): string {
  return `${title} (副本)`
}
