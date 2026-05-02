/** 仓库或主页链接，可通过环境变量覆盖 */
export const SITE_GITHUB_URL = (import.meta.env.VITE_GITHUB_URL as string | undefined)?.trim()

/** 页脚版权主体名 */
export const SITE_OWNER = (import.meta.env.VITE_OWNER as string | undefined)?.trim()

/**
 * 公安备案查询页链接（含 recordcode 参数），留空则备案文案不以链接展示。
 * 示例：https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=xxxxxxxx
 */
export const SITE_BEIAN_URL = (import.meta.env.VITE_BEIAN_URL as string | undefined)?.trim()

/** MinIO API 地址 */
export const SITE_MINIO_API_URL = (import.meta.env.VITE_MINIO_API_URL as string | undefined)?.trim()
