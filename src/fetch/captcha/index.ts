import { Post } from '@/fetch'

import type { GenerateCaptchaReqBody, GenerateCaptchaResData, VerifyCaptchaReqBody } from './types'

/** 发送验证码相关接口路径（/public-api/v1） */
const PUBLIC_CAPTCHA_API = {
  GENERATE: '/public-api/v1/captcha/generate',
  VERIFY: '/public-api/v1/captcha/verify'
} as const

/** 生成（发送）验证码 */
export function pu_v1_captcha_generate(body: GenerateCaptchaReqBody) {
  return Post<GenerateCaptchaResData>(PUBLIC_CAPTCHA_API.GENERATE, body)
}

/** 校验验证码 */
export function pu_v1_captcha_verify(body: VerifyCaptchaReqBody) {
  return Post<null>(PUBLIC_CAPTCHA_API.VERIFY, body)
}
