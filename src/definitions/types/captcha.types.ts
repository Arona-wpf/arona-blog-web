import { CaptchaTypeEnum } from '@/definitions/enums/captcha.enum'

export type CaptchaType = (typeof CaptchaTypeEnum)[keyof typeof CaptchaTypeEnum]
