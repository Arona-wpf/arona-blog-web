import { CaptchaTypeEnum } from '@/definitions/enums/captcha.enum'

/** 验证码类型联合类型（由验证码类型枚举派生） */
export type CaptchaType = (typeof CaptchaTypeEnum)[keyof typeof CaptchaTypeEnum]
