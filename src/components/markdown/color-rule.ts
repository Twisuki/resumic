import type { MarkdownIt, StateInline } from "markdown-it"

/**
 * @description markdown-it 行内规则: `<color=xxx>content</color>` 产出 `<span data-color="xxx">content</span>`
 *
 * value 只收字符白名单(防注入 CSS); 未闭合 / 标签名不匹配 / value 非法, 一律退化为字面文本
 */

/**
 * @description 产出 html 上的属性名, 也是 render.tsx 白名单的键
 */
export const COLOR_ATTR = "data-color"

/**
 * @description `<color=...>` 对应 token 的类型前缀
 */
export const COLOR_RULE_NAME = "color"

/**
 * @description value 合法字符白名单
 */
export const COLOR_VALUE_PATTERN = /^[a-z0-9#.,%()\s-]+$/i

const OPEN_TAG = "<color="
const CLOSE_TAG = "</color>"

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
  if (!COLOR_VALUE_PATTERN.test(value)) {
    return false
  }

  const contentStart = openEnd + 1
  const closeStart = state.src.indexOf(CLOSE_TAG, contentStart)
  if (closeStart < 0 || closeStart + CLOSE_TAG.length > state.posMax) {
    return false
  }

  if (!silent) {
    const token = state.push("span_open", "span", 1)
    token.attrs = [[COLOR_ATTR, value]]

    // 内层递归 inline 解析, 让 `<color=red>**粗**</color>` 里的 `**粗**` 正常成 <strong>
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
 * @description 注册 `<color=...>` 行内规则
 */
export function colorRule(md: MarkdownIt): void {
  md.inline.ruler.before("emphasis", COLOR_RULE_NAME, rule)
}
