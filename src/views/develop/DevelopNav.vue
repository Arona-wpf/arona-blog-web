<script setup lang="ts">
import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/develop/password',
    titleKey: 'views.dev.password.title',
    descriptionKey: 'views.dev.password.description'
  },
  {
    path: '/develop/nanoid',
    titleKey: 'views.dev.nanoid.title',
    descriptionKey: 'views.dev.nanoid.description'
  },
  {
    path: '/develop/json',
    titleKey: 'views.dev.json.title',
    descriptionKey: 'views.dev.json.description'
  }
]
</script>

<template>
  <ModuleNavPage
    module-title-key="layout.nav.modules.develop"
    module-description-key="layout.nav.modules.developDescription"
    :features="features"
  />
</template>
