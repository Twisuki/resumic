"use client"

/**
 * @description 用户气泡, 右对齐, 显示对方分享
 */
export default function BubbleUser({ text }: Readonly<{ text: string }>) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground whitespace-pre-wrap break-words">
        {text}
      </div>
    </div>
  )
}
