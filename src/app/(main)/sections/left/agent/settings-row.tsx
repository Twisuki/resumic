"use client"

import type { AiApiStyle, AiConfigDto } from "@shared/model"
import { IconCircle, IconCircleFilled, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useActivateConfig,
  useCreateConfig,
  useUpdateConfig,
} from "@/hooks/ai"

const API_STYLES: readonly AiApiStyle[] = ["openai", "anthropic"]

/**
 * @description 单行 AI 配置: 字段受控编辑 + 保存; 新建模式 (config=undefined) 时字段空; 同 id 由父级 key 触发重挂避免 effect 同步
 */
export default function SettingsRow({
  config,
  onRequestDelete,
  onSaved,
}: Readonly<{
  config?: AiConfigDto
  onRequestDelete?: (config: AiConfigDto) => void
  onSaved?: () => void
}>) {
  const isNew = config === undefined
  const isActive = config?.isActive ?? false

  const [label, setLabel] = useState(config?.label ?? "")
  const [apiStyle, setApiStyle] = useState<AiApiStyle>(config?.apiStyle ?? "openai")
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl ?? "")
  const [model, setModel] = useState(config?.model ?? "")
  const [key, setKey] = useState("")

  const createConfig = useCreateConfig()
  const updateConfig = useUpdateConfig()
  const activateConfig = useActivateConfig()

  const busy = createConfig.isPending || updateConfig.isPending || activateConfig.isPending

  async function handleSave() {
    if (!label.trim()) {
      toast.error("label 不能为空")
      return
    }
    if (!baseUrl.trim()) {
      toast.error("baseUrl 不能为空")
      return
    }
    if (!model.trim()) {
      toast.error("model 不能为空")
      return
    }
    try {
      if (isNew) {
        if (!key.trim()) {
          toast.error("新建时 key 必填")
          return
        }
        await createConfig.mutateAsync({
          label: label.trim(),
          apiStyle,
          baseUrl: baseUrl.trim(),
          model: model.trim(),
          key: key.trim(),
        })
      }
      else {
        const payload: Parameters<typeof updateConfig.mutateAsync>[0] = {
          id: config!.id,
          data: {
            label: label.trim(),
            apiStyle,
            baseUrl: baseUrl.trim(),
            model: model.trim(),
          },
        }
        if (key.trim())
          payload.data.key = key.trim()
        await updateConfig.mutateAsync(payload)
      }
      setKey("")
      onSaved?.()
    }
    catch (e) {
      toast.error(`保存失败: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  async function handleActivate() {
    if (!config || isActive)
      return
    try {
      await activateConfig.mutateAsync(config.id)
    }
    catch (e) {
      toast.error(`切换失败: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <div className="rounded-md border border-sidebar-border bg-card p-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={isActive ? "当前激活" : "切到这条"}
          disabled={!config || isActive}
          onClick={handleActivate}
          className="shrink-0 text-muted-foreground hover:text-foreground disabled:cursor-default"
        >
          {isActive
            ? <IconCircleFilled className="size-4 text-primary" />
            : <IconCircle className="size-4" />}
        </button>
        <Input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="label"
          className="h-7 text-xs"
          disabled={busy}
        />
        {!isNew && config && onRequestDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="删除"
            disabled={busy}
            onClick={() => onRequestDelete(config)}
          >
            <IconTrash className="size-3.5" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-2 text-xs">
        <span className="text-muted-foreground">apiStyle</span>
        <select
          value={apiStyle}
          onChange={e => setApiStyle(e.target.value as AiApiStyle)}
          disabled={busy}
          className="h-7 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {API_STYLES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-muted-foreground">baseUrl</span>
        <Input
          value={baseUrl}
          onChange={e => setBaseUrl(e.target.value)}
          placeholder="https://api.openai.com/v1"
          className="h-7 text-xs"
          disabled={busy}
        />
        <span className="text-muted-foreground">model</span>
        <Input
          value={model}
          onChange={e => setModel(e.target.value)}
          placeholder="gpt-4o-mini"
          className="h-7 text-xs"
          disabled={busy}
        />
        <span className="text-muted-foreground">
          key
          {!isNew && <span className="ml-1 text-[10px]">(留空不修改)</span>}
        </span>
        <Input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder={isNew ? "必填" : "****"}
          className="h-7 text-xs"
          disabled={busy}
        />
      </div>
      <div className="flex justify-end">
        <Button type="button" size="sm" disabled={busy} onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  )
}
