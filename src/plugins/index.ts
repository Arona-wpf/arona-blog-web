import { type App } from 'vue'

import i18n from '@/plugins/i18n'
import router from '@/plugins/router'
import store from '@/plugins/store'

export default (app: App) => {
  app.use(i18n)
  app.use(store)
  app.use(router)
}
