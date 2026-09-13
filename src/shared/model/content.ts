export interface ContentLine {
  id: string
  content: string
}

export interface Content {
  lines: ContentLine[]
  orders: string[]
}
