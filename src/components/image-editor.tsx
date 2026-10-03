"use client"

import type { Area, Point } from "react-easy-crop"
import { IconRotate, IconRotate2, IconX } from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { processImage } from "@/hooks/use-image-process"

/**
 * @description 图片裁剪 / 旋转 / 缩放编辑器; 接收 File, 确认后回调处理过的 webp File (已压缩到 1MB 以内)
 *
 * 流程: react-easy-crop UI 输出 croppedAreaPixels + rotation → canvas 应用 → browser-image-compression 压缩 → 回调给父
 */
export default function ImageEditor({
  open,
  onOpenChange,
  file,
  onConfirm,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  file: File | null
  onConfirm: (processed: File) => void
}>) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const lastFileRef = useRef<File | null>(null)

  // 打开新文件时重置编辑器状态
  useEffect(() => {
    if (file && file !== lastFileRef.current) {
      lastFileRef.current = file
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setPixelCrop(null)
    }
  }, [file])

  const src = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    if (!src)
      return undefined
    return () => URL.revokeObjectURL(src)
  }, [src])

  const handleCropComplete = useCallback((_area: Area, pixels: Area) => {
    setPixelCrop(pixels)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!file || !pixelCrop)
      return
    setBusy(true)
    try {
      const processed = await processImage(file, pixelCrop, rotation)
      onConfirm(processed)
      onOpenChange(false)
    }
    catch (e) {
      // eslint-disable-next-line no-alert -- 编辑失败, 浏览器原生 alert 比 toast 更醒目, 一次性提示
      alert(e instanceof Error ? e.message : String(e))
    }
    finally {
      setBusy(false)
    }
  }, [file, pixelCrop, rotation, onConfirm, onOpenChange])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>编辑图片</DialogTitle>
        </DialogHeader>

        {src && (
          <div className="relative h-72 w-full overflow-hidden rounded-md bg-black">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              minZoom={1}
              maxZoom={4}
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={handleCropComplete}
              style={{
                containerStyle: { backgroundColor: "#000" },
                cropAreaStyle: { border: "2px solid white" },
              }}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">缩放</span>
            <span className="text-muted-foreground tabular-nums w-10 text-right">
              {zoom.toFixed(2)}
              x
            </span>
          </div>
          <Slider
            min={1}
            max={4}
            step={0.05}
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="逆时针旋转 90°"
              onClick={() => setRotation(r => r - 90)}
            >
              <IconRotate2 className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="顺时针旋转 90°"
              onClick={() => setRotation(r => r + 90)}
            >
              <IconRotate className="size-4" />
            </Button>
            <span className="ml-auto text-xs text-muted-foreground">
              {rotation % 360}
              °
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={busy}
          >
            <IconX className="mr-1 size-4" />
            取消
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={busy || !pixelCrop}
          >
            {busy ? "处理中..." : "确认"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
