import { genId } from "@/lib/id"

/**
 * @description 一行 markdown 源, content 末尾保留换行
 */
export interface Line {
  id: string
  content: string
}

/**
 * @description 行级差异: 编辑 / 删除 / 新增 / 目标顺序
 */
export interface LineDiff {
  edits: { id: string, content: string }[]
  removes: string[]
  adds: Line[]
  order: string[]
}

/**
 * @description md 字符串按行切分, \n 归属上一行 (与富文本行定义一致)
 */
export function splitLines(text: string): string[] {
  return text.split(/(?<=\n)/)
}

/**
 * @description 行内容拼接回 md 字符串
 */
export function joinLines(lines: Line[]): string {
  return lines.map(line => line.content).join("")
}

/**
 * @description 最长公共子序列, 返回内容相同的旧行 / 新行下标对
 */
function lcsMatches(oldContents: string[], newContents: string[]): Array<[number, number]> {
  const rows = oldContents.length
  const cols = newContents.length
  const dp: number[][] = Array.from({ length: rows + 1 }, () => Array.from<number>({ length: cols + 1 }).fill(0))

  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      dp[i][j] = oldContents[i] === newContents[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const matches: Array<[number, number]> = []
  let i = 0
  let j = 0
  while (i < rows && j < cols) {
    if (oldContents[i] === newContents[j]) {
      matches.push([i, j])
      i++
      j++
    }
    else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++
    }
    else {
      j++
    }
  }
  return matches
}

/**
 * @description 旧行与新行内容做差异, 以 LCS 锚点对齐后, 空隙内按位置配对
 * 同位置不同内容 → 编辑(保留原 id); 多出的旧行 → 删除; 多出的新行 → 新增(新 id)
 */
export function diffLines(oldLines: Line[], newContents: string[]): LineDiff {
  const diff: LineDiff = { edits: [], removes: [], adds: [], order: [] }
  const oldContents = oldLines.map(line => line.content)

  function resolveGap(oldStart: number, oldEnd: number, newStart: number, newEnd: number) {
    const oldLen = oldEnd - oldStart
    const newLen = newEnd - newStart
    const paired = Math.min(oldLen, newLen)

    for (let k = 0; k < paired; k++) {
      const oldLine = oldLines[oldStart + k]
      const content = newContents[newStart + k]
      if (oldLine.content !== content)
        diff.edits.push({ id: oldLine.id, content })
      diff.order.push(oldLine.id)
    }
    for (let k = paired; k < oldLen; k++)
      diff.removes.push(oldLines[oldStart + k].id)
    for (let k = paired; k < newLen; k++) {
      const line = { id: genId(), content: newContents[newStart + k] }
      diff.adds.push(line)
      diff.order.push(line.id)
    }
  }

  let prevOld = 0
  let prevNew = 0
  for (const [oldIndex, newIndex] of lcsMatches(oldContents, newContents)) {
    resolveGap(prevOld, oldIndex, prevNew, newIndex)
    diff.order.push(oldLines[oldIndex].id)
    prevOld = oldIndex + 1
    prevNew = newIndex + 1
  }
  resolveGap(prevOld, oldLines.length, prevNew, newContents.length)

  return diff
}
