"use client"

import type { SectionNode } from "@shared/model/node"
import { SECTION_ICON_PLACEHOLDER } from "@/app/(main)/sections/right/options/section-edit-dialog/constants"
import Icon from "@/components/icon"
import PatchField from "@/components/patch-field"
import { Button } from "@/components/ui/button"
import { useNode } from "@/hooks/node"

/**
 * @description 章节基础字段: 图标占位 + 标题
 */
export default function BaseInfo({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as SectionNode | undefined
  const icon = node?.self.icon || SECTION_ICON_PLACEHOLDER

  return (
    <div className="flex items-end gap-3">
      <div className="flex shrink-0 flex-col items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled
          title="图标选择待实现"
          aria-label="选择图标"
        >
          <Icon name={icon} className="size-4" />
        </Button>
        <span className="text-[10px] text-muted-foreground">图标</span>
      </div>

      <PatchField
        id={id}
        field="title"
        label="标题"
        placeholder="例如: 教育经历"
        className="flex-1"
      />
    </div>
  )
}
