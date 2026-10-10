"use client"

import { IconLoader2, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { DEFAULT_RESUME } from "@/config/resume"
import { useResumeCreate } from "@/hooks/query/resume"

/** @description 已登录但没加载简历时的占位, 引导选择简历或新建 */
export default function EmptyPlaceholder() {
  const create = useResumeCreate()
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-base font-medium text-foreground">未加载简历</h2>
      <p className="text-sm text-muted-foreground">请加载简历, 或</p>
      <Button
        disabled={create.isPending}
        onClick={() => create.mutate(DEFAULT_RESUME)}
      >
        {create.isPending
          ? (
              <IconLoader2 className="animate-spin" />
            )
          : (
              <IconPlus />
            )}
        新建简历
      </Button>
    </div>
  )
}
