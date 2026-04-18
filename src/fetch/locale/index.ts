import { Get } from '@/fetch'

import type { GetLocaleResData, SetLocaleReqBody } from './types'

/** 设置语言相关接口路径（/public-api/v1） */
const PUBLIC_LOCALE_API = {
  GET_LOCALE: '/public-api/v1/locale/get',
  SET_LOCALE: '/public-api/v1/locale/set'
} as const

/** 获取语言 */
export function pu_v1_locale_get() {
  return Get<GetLocaleResData>(PUBLIC_LOCALE_API.GET_LOCALE)
}

/** 设置语言 */
export function pu_v1_locale_set(body: SetLocaleReqBody) {
  return Get<null>(PUBLIC_LOCALE_API.SET_LOCALE, body)
}
