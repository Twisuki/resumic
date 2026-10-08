/**
 * @description A4 纸张大小 (96dpi CSS 像素)
 */
export const PAPER = {
  WIDTH: 794,
  HEIGHT: 1123,
}

/**
 * @description Paper 内边距 (4rem = 64px, 与 Paper 组件 className="p-16" 保持同步)
 * 修改 Paper 的 padding 时务必同步这里
 */
const PAPER_PADDING = 64

/**
 * @description Paper 内容区 (扣除 padding)
 * Page 用这个值做宽度反向补偿, 让缩放时视觉宽度固定 = 内容区宽度
 * zoom=1 时 layout 宽 666 = 内容区宽, 视觉也 666, 正好对齐 padding, 不侵占
 */
export const PAPER_CONTENT_AREA = {
  WIDTH: PAPER.WIDTH - 2 * PAPER_PADDING,
  HEIGHT: PAPER.HEIGHT - 2 * PAPER_PADDING,
}
