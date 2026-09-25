"use client"

import type { SectionNode } from "@shared/model/node"
import { SECTION_ICON_PLACEHOLDER } from "@/app/(main)/sections/right/options/section-edit-dialog/constants"
import Icon from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useNode } from "@/hooks/node"
import { usePatchInput } from "@/hooks/patch-input"

/**
 * @description 章节基础字段: "标题" label 在上, 下侧左侧图标按钮、右侧输入框
 */
export default function BaseInfo({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as SectionNode | undefined
  const icon = node?.self.icon || SECTION_ICON_PLACEHOLDER
  const title = usePatchInput(id, "title", node?.self.title ?? "")
  const inputId = `section-title-${id}`

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>标题</FieldLabel>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled
          title="图标选择待实现"
          aria-label="选择图标"
          className="shrink-0"
        >
          <Icon name={icon} className="size-4" />
        </Button>

        <Input
          id={inputId}
          value={title.value}
          placeholder="例如: 教育经历"
          onChange={e => title.onChange(e.target.value)}
          onFocus={title.onFocus}
          onBlur={title.onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
        />
      </div>
    </Field>
  )
}
