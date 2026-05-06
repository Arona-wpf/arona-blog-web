<script setup lang="ts">
import { Calculator, Globe, Timer } from 'lucide-vue-next'

import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/time/timestamp',
    titleKey: 'views.time.timestamp.title',
    descriptionKey: 'views.time.timestamp.description',
    icon: Timer
  },
  {
    path: '/time/calculator',
    titleKey: 'views.time.calculator.title',
    descriptionKey: 'views.time.calculator.description',
    icon: Calculator
  },
  {
    path: '/time/world',
    titleKey: 'views.time.world.title',
    descriptionKey: 'views.time.world.description',
    icon: Globe
  }
]
</script>

<template>
  <ModuleNavPage
    module-title-key="layout.nav.modules.time"
    module-description-key="layout.nav.modules.timeDescription"
    :features="features"
  />
</template>
