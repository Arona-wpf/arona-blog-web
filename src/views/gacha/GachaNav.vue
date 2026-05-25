<script setup lang="ts">
import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/gacha/genshin',
    titleKey: 'views.gacha.genshin.title',
    descriptionKey: 'views.gacha.genshin.description',
    icon: '/minio/image/2026-05/genshin_impact.png'
  },
  {
    path: '/gacha/starrail',
    titleKey: 'views.gacha.starrail.title',
    descriptionKey: 'views.gacha.starrail.description',
    icon: '/minio/image/2026-05/honkai_starrail.png'
  },
  {
    path: '/gacha/zzz',
    titleKey: 'views.gacha.zzz.title',
    descriptionKey: 'views.gacha.zzz.description',
    icon: '/minio/image/2026-05/zenless_zone_zero.png'
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
