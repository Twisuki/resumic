import type { ReactNode } from "react"

/**
 * @description 无序列表
 *
 * 圆点用 li 的 before 伪元素画实心圆点, 不依赖原生 marker(它的尺寸与位置不好控制)
 *
 * 样式挂在 li 上, 但 ul 拿不到 li 的 props, 所以用 [&>li] 子选择器, 同时不影响嵌套列表
 */
export default function Ul({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <ul className="list-none space-y-2 pl-4 [&>li]:relative [&>li]:before:absolute [&>li]:before:top-[0.55em] [&>li]:before:-left-3 [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-current [&>li]:before:content-['']">
      {children}
    </ul>
  )
}
