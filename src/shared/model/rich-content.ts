import type { Collection } from "@shared/model/collection"

/**
 * @description 富文本行
 */
export interface ContentLine {
  id: string
  content: string
}

/**
 * @description 富文本块
 */
export type RichContent = Collection<ContentLine>
