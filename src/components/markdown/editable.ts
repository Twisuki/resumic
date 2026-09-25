import { COLOR_VALUE_PATTERN } from "@/components/markdown/color-rule"
import { SIZE_MAX, SIZE_MIN, SIZE_VALUE_PATTERN } from "@/components/markdown/size-rule"

/**
 * @description token 包裹标记: data-md-start / data-md-end 为该 token 在全源里的绝对区间
 */
const TOKEN_ATTR = "data-md-token"

interface Match {
  html: string
  end: number
}

/**
 * @description 转义文本节点里的 HTML 特殊字符
 */
function escapeText(text: string): string {
  return text.replace(/[&<>]/g, (char) => {
    if (char === "&")
      return "&amp;"
    if (char === "<")
      return "&lt;"
    return "&gt;"
  })
}

/**
 * @description 分隔符 span, 字符仍在 DOM 文本流中, 显隐由 CSS 按 data-md-active 控制
 */
function syntax(raw: string): string {
  return `<span class="md-syntax">${escapeText(raw)}</span>`
}

/**
 * @description token 包裹, 带上源区间供编辑器按光标激活
 */
function wrap(start: number, end: number, inner: string): string {
  return `<span ${TOKEN_ATTR} data-md-start="${start}" data-md-end="${end}">${inner}</span>`
}

/**
 * @description 校验自定义行内标签的 value
 */
function isValidValue(name: string, value: string): boolean {
  if (name === "color")
    return COLOR_VALUE_PATTERN.test(value)
  return SIZE_VALUE_PATTERN.test(value) && Number(value) >= SIZE_MIN && Number(value) <= SIZE_MAX
}

/**
 * @description 折叠是否够格: 闭合分隔符后必须是行尾或非字母数字, 否则 **加粗**x 不该被折叠
 */
function isBoundary(text: string, index: number): boolean {
  if (index >= text.length)
    return true
  return !/[\p{L}\p{N}]/u.test(text[index])
}

/**
 * @description 配对包裹类 token: 开分隔符 + 内容 + 闭分隔符, 分隔符零宽
 */
function matchWrap(text: string, start: number, delimiter: string, tag: string, base: number): Match | null {
  const contentStart = start + delimiter.length
  if (contentStart >= text.length || /\s/.test(text[contentStart]))
    return null
  const closeIndex = text.indexOf(delimiter, contentStart)
  if (closeIndex < 0 || /\s/.test(text[closeIndex - 1]))
    return null
  if (!isBoundary(text, closeIndex + delimiter.length))
    return null

  const inner = renderInline(text.slice(contentStart, closeIndex), base + contentStart)
  return {
    html: wrap(
      base + start,
      base + closeIndex + delimiter.length,
      `${syntax(delimiter)}<${tag}>${inner}</${tag}>${syntax(delimiter)}`,
    ),
    end: closeIndex + delimiter.length,
  }
}

/**
 * @description `<color=...>` / `<size=...>` 配对标签, 开闭标签零宽, 内容按值加内联样式
 */
function matchPairedTag(text: string, start: number, name: string, base: number): Match | null {
  const open = `<${name}=`
  if (!text.startsWith(open, start))
    return null

  const gt = text.indexOf(">", start + open.length)
  if (gt < 0)
    return null

  const value = text.slice(start + open.length, gt).trim()
  if (!isValidValue(name, value))
    return null

  const close = `</${name}>`
  const closeIndex = text.indexOf(close, gt + 1)
  if (closeIndex < 0 || !isBoundary(text, closeIndex + close.length))
    return null

  const inner = renderInline(text.slice(gt + 1, closeIndex), base + gt + 1)
  const style = name === "color" ? `color:${value}` : `font-size:${value}em`
  return {
    html: wrap(
      base + start,
      base + closeIndex + close.length,
      `${syntax(text.slice(start, gt + 1))}<span style="${style}">${inner}</span>${syntax(close)}`,
    ),
    end: closeIndex + close.length,
  }
}

/**
 * @description 行内 md 源渲染为可编辑 html: 完整 token 折叠为富文本, 未完成 token 保持字面
 * 全部源字符都作为文本节点保留, 所以 textContent 恒等于源, 光标按字符偏移即可对齐
 * base 是当前切片在源里的起点, 递归时下传, 保证 data-md-start / data-md-end 是绝对偏移
 */
function renderInline(text: string, base: number): string {
  let out = ""
  let i = 0

  while (i < text.length) {
    const char = text[i]

    if (char === "<") {
      const tag = matchPairedTag(text, i, "color", base) ?? matchPairedTag(text, i, "size", base)
      if (tag) {
        out += tag.html
        i = tag.end
        continue
      }
    }

    if (char === "`") {
      const close = text.indexOf("`", i + 1)
      if (close > i + 1) {
        out += wrap(
          base + i,
          base + close + 1,
          `${syntax("`")}<code>${escapeText(text.slice(i + 1, close))}</code>${syntax("`")}`,
        )
        i = close + 1
        continue
      }
    }

    if (char === "*" || char === "_") {
      const double = char + char
      if (text.startsWith(double, i)) {
        const match = matchWrap(text, i, double, "strong", base)
        if (match) {
          out += match.html
          i = match.end
        }
        else {
          out += escapeText(double)
          i += 2
        }
        continue
      }
      const match = matchWrap(text, i, char, "em", base)
      if (match) {
        out += match.html
        i = match.end
        continue
      }
    }

    if (char === "~" && text.startsWith("~~", i)) {
      const match = matchWrap(text, i, "~~", "s", base)
      if (match) {
        out += match.html
        i = match.end
      }
      else {
        out += escapeText("~~")
        i += 2
      }
      continue
    }

    out += escapeText(char)
    i++
  }

  return out
}

/**
 * @description 可编辑态的源渲染, 保留全部字符, 仅折叠完整行内 token
 */
export function renderEditable(source: string): string {
  return renderInline(source, 0)
}
