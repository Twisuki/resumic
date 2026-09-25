"use client"

import type { SectionNode } from "@shared/model/node"
import { SECTION_ICON_PLACEHOLDER } from "@/app/(main)/sections/right/options/section-edit-dialog/constants"
import Icon from "@/components/icon"
import IconPicker from "@/components/icon-picker"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useHistory } from "@/hooks/history"
import { useNode } from "@/hooks/node"
import { usePatchInput } from "@/hooks/patch-input"

/**
 * @description 章节基础字段: "标题" label 在上, 下侧左侧图标按钮、右侧输入框
 */
export default function BaseInfo({ id }: Readonly<{ id: string }>) {
  const node = useNode(id) as SectionNode | undefined
  const icon = node?.self.icon || SECTION_ICON_PLACEHOLDER
  const title = usePatchInput(id, "title", node?.self.title ?? "")
  const { patch } = useHistory()
  const inputId = `section-title-${id}`

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>标题</FieldLabel>

      <div className="flex items-center gap-2">
        <IconPicker
          value={icon}
          onSelect={name => patch.update(id, "icon", name)}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="选择图标"
            className="shrink-0"
          >
            <Icon name={icon} className="size-4" />
          </Button>
        </IconPicker>

        <Input
          id={inputId}
          placeholder="例如: 教育经历"
          {...title}
        />
      </div>
    </Field>
  )
}
