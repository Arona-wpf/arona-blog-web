import '@/style.css'

import { createApp } from 'vue'

import plugins from '@/plugins/index'

import App from './App.vue'

const app = createApp(App)

app.use(plugins)

app.mount('#arona-blog')
