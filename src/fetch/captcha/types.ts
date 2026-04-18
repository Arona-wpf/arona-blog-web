import type { CaptchaType } from '@/definitions/types/captcha.types'

/** 生成（发送）验证码请求 */
export interface GenerateCaptchaReqBody {
  email: string
  type: CaptchaType
}

/** 生成（发送）验证码响应 */
export interface GenerateCaptchaResData {
  cache_id: string
  /** 服务端 cache 过期时间（unix 秒或毫秒，可选） */
  expire?: number
}

/** 校验验证码请求 */
export interface VerifyCaptchaReqBody {
  account?: string
  email?: string
  type: CaptchaType
  cache_id: string
  captcha: string
}
