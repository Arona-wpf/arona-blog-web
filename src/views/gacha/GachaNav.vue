<script setup lang="ts">
import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/gacha/genshin',
    titleKey: 'views.gacha.genshin.title',
    descriptionKey: 'views.gacha.genshin.description'
  },
  {
    path: '/gacha/starrail',
    titleKey: 'views.gacha.starrail.title',
    descriptionKey: 'views.gacha.starrail.description'
  },
  {
    path: '/gacha/zzz',
    titleKey: 'views.gacha.zzz.title',
    descriptionKey: 'views.gacha.zzz.description'
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
