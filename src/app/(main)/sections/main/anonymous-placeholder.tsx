"use client"

import { IconLayout, IconMarkdown, IconSparkles } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLoginTrigger } from "@/hooks/login"

/** @description 未登录态主区域占位, 简介 + GitHub 登录 / 查看仓库 */
export default function AnonymousPlaceholder() {
  const { pending: loginPending, trigger: triggerLogin } = useLoginTrigger()
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm">
      <div className="flex flex-col items-center gap-1.5">
        <h1 className="text-3xl font-semibold text-primary">
          Resumic
          {" "}
          简历制作器
        </h1>
        <p className="text-sm text-muted-foreground">
          by
          {" "}
          <Link
            href="https://github.com/Twisuki"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            Twisuki
          </Link>
        </p>
      </div>

      <ul className="flex flex-col gap-2 text-sm text-foreground">
        <li className="flex items-center gap-2">
          <IconSparkles className="size-4 shrink-0" />
          <span>接入 AI 助手打磨内容</span>
        </li>
        <li className="flex items-center gap-2">
          <IconLayout className="size-4 shrink-0" />
          <span>精心设计的简历排版</span>
        </li>
        <li className="flex items-center gap-2">
          <IconMarkdown className="size-4 shrink-0" />
          <span>MarkDown 优先的富文本支持</span>
        </li>
      </ul>

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">来试试吧</p>
        <div className="flex gap-2">
          <Button
            disabled={loginPending}
            onClick={triggerLogin}
          >
            GitHub 登录
          </Button>
          <Button variant="outline" asChild>
            <Link
              href="https://github.com/Twisuki/resumic"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看仓库
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
