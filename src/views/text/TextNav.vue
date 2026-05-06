<script setup lang="ts">
import { FileText, Globe, Hash } from 'lucide-vue-next'

import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/text/url',
    titleKey: 'views.text.url.title',
    descriptionKey: 'views.text.url.description',
    icon: Globe
  },
  {
    path: '/text/unicode',
    titleKey: 'views.text.unicode.title',
    descriptionKey: 'views.text.unicode.description',
    icon: FileText
  },
  {
    path: '/text/hex',
    titleKey: 'views.text.hex.title',
    descriptionKey: 'views.text.hex.description',
    icon: Hash
  }
]
</script>

<template>
  <ModuleNavPage
    module-title-key="layout.nav.modules.text"
    module-description-key="layout.nav.modules.textDescription"
    :features="features"
  />
</template>
