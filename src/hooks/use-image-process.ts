import type { Area } from "react-easy-crop"
import imageCompression from "browser-image-compression"

/**
 * @description 输出文件硬上限, 与 service/avatar.ts 服务端常量对齐
 */
const MAX_BYTES = 1 * 1024 * 1024

/**
 * @description canvas 把 (crop + rotation) 应用到原图, 输出 webp blob
 */
async function cropAndRotateToBlob(
  sourceUrl: string,
  pixelCrop: Area,
  rotation: number,
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("图片加载失败"))
    img.src = sourceUrl
  })

  // 旋转后画布尺寸 (旋转 0/180 时 = 原图, 90/270 时高宽互换)
  const rotatedW = rotation % 180 === 0 ? image.naturalWidth : image.naturalHeight
  const rotatedH = rotation % 180 === 0 ? image.naturalHeight : image.naturalWidth

  const rotateCanvas = document.createElement("canvas")
  rotateCanvas.width = rotatedW
  rotateCanvas.height = rotatedH
  const rctx = rotateCanvas.getContext("2d")
  if (!rctx)
    throw new Error("canvas 2d context 不可用")

  rctx.translate(rotatedW / 2, rotatedH / 2)
  rctx.rotate((rotation * Math.PI) / 180)
  rctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)

  // 在旋转后画布上裁出像素框
  const cropCanvas = document.createElement("canvas")
  cropCanvas.width = pixelCrop.width
  cropCanvas.height = pixelCrop.height
  const cctx = cropCanvas.getContext("2d")
  if (!cctx)
    throw new Error("canvas 2d context 不可用")
  cctx.drawImage(
    rotateCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    cropCanvas.toBlob(b => b ? resolve(b) : reject(new Error("canvas 转 blob 失败")), "image/webp", 0.92)
  })
  return blob
}

/**
 * @description 图片预处理: 原图 + crop + rotation → canvas 应用 → webp blob → 压到 1MB 以内
 * 直接 await 即可, 不依赖 React state, 不需要 hook 包装
 */
export async function processImage(
  file: File,
  pixelCrop: Area,
  rotation: number,
): Promise<File> {
  const url = URL.createObjectURL(file)
  try {
    const blob = await cropAndRotateToBlob(url, pixelCrop, rotation)
    return await imageCompression(new File([blob], "avatar.webp", { type: "image/webp" }), {
      maxSizeMB: MAX_BYTES / (1024 * 1024),
      maxWidthOrHeight: 1024,
      fileType: "image/webp",
      initialQuality: 0.92,
    })
  }
  finally {
    URL.revokeObjectURL(url)
  }
}
