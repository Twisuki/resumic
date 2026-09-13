import type { MarkdownIt, StateInline } from "markdown-it"

/**
 * @description markdown-it 行内规则: `<size=1.5>content</size>` 产出 `<span data-size="1.5">content</span>`
 *
 * value 须是纯数字且落在上下界内, 决定 `font-size: {value}em`; 未闭合 / 标签名不匹配 / value 非法或越界, 一律退化为字面文本
 */

/**
 * @description 产出 html 上的属性名, 也是 render.tsx 白名单的键
 */
export const SIZE_ATTR = "data-size"

/**
 * @description `<size=...>` 对应 token 的类型前缀
 */
export const SIZE_RULE_NAME = "size"

/**
 * @description value 合法格式: 正整数或小数
 */
export const SIZE_VALUE_PATTERN = /^\d+(\.\d+)?$/

/**
 * @description 下界, 防止把内容缩到看不见
 */
export const SIZE_MIN = 0.5

/**
 * @description 上界, 防止一个 <size=99> 把版面撑爆
 */
export const SIZE_MAX = 3

const OPEN_TAG = "<size="
const CLOSE_TAG = "</size>"

function rule(state: StateInline, silent: boolean): boolean {
  const valueStart = state.pos + OPEN_TAG.length

  if (!state.src.startsWith(OPEN_TAG, state.pos)) {
    return false
  }

  const openEnd = state.src.indexOf(">", valueStart)
  if (openEnd < 0 || openEnd >= state.posMax) {
    return false
  }

  const value = state.src.slice(valueStart, openEnd).trim()
  const size = Number(value)
  if (!SIZE_VALUE_PATTERN.test(value) || size < SIZE_MIN || size > SIZE_MAX) {
    return false
  }

  const contentStart = openEnd + 1
  const closeStart = state.src.indexOf(CLOSE_TAG, contentStart)
  if (closeStart < 0 || closeStart + CLOSE_TAG.length > state.posMax) {
    return false
  }

  if (!silent) {
    const token = state.push("span_open", "span", 1)
    token.attrs = [[SIZE_ATTR, value]]

    // 内层递归 inline 解析, 让 `<size=1.5>**粗**</size>` 里的 `**粗**` 正常成 <strong>
    const { pos, posMax } = state
    state.pos = contentStart
    state.posMax = closeStart
    state.md.inline.tokenize(state)
    state.pos = pos
    state.posMax = posMax

    state.push("span_close", "span", -1)
  }

  // 返回 true 必须推进 pos, 否则 markdown-it 的 tokenize 会抛错
  state.pos = closeStart + CLOSE_TAG.length
  return true
}

/**
 * @description 注册 `<size=...>` 行内规则
 */
export function sizeRule(md: MarkdownIt): void {
  md.inline.ruler.before("emphasis", SIZE_RULE_NAME, rule)
}
