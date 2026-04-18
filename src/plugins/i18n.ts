import { createI18n } from 'vue-i18n'

import { LocaleEnum } from '@/definitions/enums/common.enum'
import en_US from '@/locale/en_us'
import zh_CN from '@/locale/zh_cn'

export type LangKeyType = typeof zh_CN

export const LOCALE_STORAGE_KEY = 'arona-locale'

function readStoredLocale(): string {
  if (typeof localStorage === 'undefined') {
    return LocaleEnum.ZH_CN
  }
  const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
  return raw === LocaleEnum.EN_US || raw === LocaleEnum.ZH_CN ? raw : LocaleEnum.ZH_CN
}

const i18n = createI18n<[LangKeyType], string>({
  globalInjection: true,
  legacy: false,
  locale: readStoredLocale(),
  fallbackLocale: LocaleEnum.ZH_CN,
  messages: {
    [LocaleEnum.ZH_CN]: zh_CN,
    [LocaleEnum.EN_US]: en_US
  },
  // 禁用缺失翻译时的警告
  missing: (locale, key) => {
    // 自定义缺失的翻译行为，这里我们直接返回原始 key 或空字符串
    return key
  },
  warnHtmlInMessage: 'off' // 禁止 HTML 的警告
})

export default i18n
