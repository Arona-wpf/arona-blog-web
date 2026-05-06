<script setup lang="ts">
import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/text/url',
    titleKey: 'views.text.url.title',
    descriptionKey: 'views.text.url.description'
  },
  {
    path: '/text/unicode',
    titleKey: 'views.text.unicode.title',
    descriptionKey: 'views.text.unicode.description'
  },
  {
    path: '/text/hex',
    titleKey: 'views.text.hex.title',
    descriptionKey: 'views.text.hex.description'
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
