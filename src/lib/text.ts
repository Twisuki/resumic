/**
 * @description 输入内容是否命中词边界 (空白)
 */
export function isWordBoundary(data: string | null): boolean {
  return data !== null && /\s/.test(data)
}
