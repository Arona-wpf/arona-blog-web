import type { LocaleType } from '@/definitions/types/common.types'

/** 设置语言请求 */
export interface SetLocaleReqBody {
  locale: LocaleType
}

/** 获取语言响应 */
export interface GetLocaleResData {
  locale: LocaleType
}
