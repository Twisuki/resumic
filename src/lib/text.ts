/**
 * @description 输入内容是否命中词边界 (空白)
 */
export function isWordBoundary(data: string | null): boolean {
  return data !== null && /\s/.test(data)
}

/**
 * @description 输入事件是否换行 (contenteditable 的 insertParagraph / insertLineBreak)
 */
export function isLineBreak(inputType: string | undefined): boolean {
  return inputType === "insertParagraph" || inputType === "insertLineBreak"
}
