"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useNode } from "@/hooks/node"
import { usePatchInput } from "@/hooks/patch-input"

/**
 * @description 绑定节点的文本输入框, 按"词"提交 patch (IME 以合成词为粒度)
 */
export default function PatchField({
  id,
  field,
  label,
  placeholder,
  className,
  inputClassName,
}: Readonly<{
  id: string
  field: string
  label: string
  placeholder?: string
  className?: string
  inputClassName?: string
}>) {
  const node = useNode(id)
  const value = String((node?.self as Record<string, unknown> | undefined)?.[field] ?? "")
  const input = usePatchInput(id, field, value)
  const inputId = `patch-field-${id}-${field}`

  return (
    <Field className={className}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        id={inputId}
        placeholder={placeholder}
        className={inputClassName}
        {...input}
      />
    </Field>
  )
}
