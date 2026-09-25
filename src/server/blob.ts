import { del, put } from "@vercel/blob"
import { ENV } from "@/config/env"

/**
 * @description Vercel Blob 访问入口, 统一注入 access / token / 覆盖策略
 */
export const blob = {
  /**
   * @description 上传文件到指定 pathname (公开可读), 返公网 URL
   */
  async put(pathname: string, file: File, overwrite = false): Promise<string> {
    const result = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: overwrite,
      contentType: file.type,
      token: ENV.BLOB_READ_WRITE_TOKEN,
    })
    return result.url
  },

  /**
   * @description 按公网 URL 删除 blob
   */
  async delete(url: string): Promise<void> {
    await del(url, { token: ENV.BLOB_READ_WRITE_TOKEN })
  },
}
