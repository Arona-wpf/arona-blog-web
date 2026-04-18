import { LocaleEnum } from '@/definitions/enums/common.enum'
import { mergeFlatLocaleParts } from '@/locale/flatToNested'

import global from './global.json'
import layout from './layout.json'
import viewsCrypto from './views.crypto.json'
import viewsDev from './views.dev.json'
import viewsOther from './views.other.json'
import viewsText from './views.text.json'
import viewsTime from './views.time.json'
import viewsUser from './views.user.json'

export default {
  locale: LocaleEnum.EN_US,
  localeType: {
    [LocaleEnum.ZH_CN]: 'Chinese (Simplified)',
    [LocaleEnum.EN_US]: 'English'
  },
  ...mergeFlatLocaleParts(
    global as Record<string, string>,
    layout as Record<string, string>,
    viewsDev as Record<string, string>,
    viewsCrypto as Record<string, string>,
    viewsTime as Record<string, string>,
    viewsText as Record<string, string>,
    viewsOther as Record<string, string>,
    viewsUser as Record<string, string>
  )
}
