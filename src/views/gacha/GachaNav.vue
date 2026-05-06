<script setup lang="ts">
import { FileText } from 'lucide-vue-next'

import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/gacha/genshin',
    titleKey: 'views.gacha.genshin.title',
    descriptionKey: 'views.gacha.genshin.description',
    icon: FileText
  },
  {
    path: '/gacha/starrail',
    titleKey: 'views.gacha.starrail.title',
    descriptionKey: 'views.gacha.starrail.description',
    icon: FileText
  },
  {
    path: '/gacha/zzz',
    titleKey: 'views.gacha.zzz.title',
    descriptionKey: 'views.gacha.zzz.description',
    icon: FileText
  }
]
</script>

<template>
  <ModuleNavPage
    module-title-key="layout.nav.modules.gacha"
    module-description-key="layout.nav.modules.gachaDescription"
    :features="features"
  />
</template>
