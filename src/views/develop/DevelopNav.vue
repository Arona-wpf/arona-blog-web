<script setup lang="ts">
import { Binary, Braces, Database, Fingerprint, Hash, KeyRound, Palette } from 'lucide-vue-next'

import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/develop/password',
    titleKey: 'views.dev.password.title',
    descriptionKey: 'views.dev.password.description',
    icon: KeyRound
  },
  {
    path: '/develop/nanoid',
    titleKey: 'views.dev.nanoid.title',
    descriptionKey: 'views.dev.nanoid.description',
    icon: Fingerprint
  },
  {
    path: '/develop/json',
    titleKey: 'views.dev.json.title',
    descriptionKey: 'views.dev.json.description',
    icon: Braces
  },
  {
    path: '/develop/byte',
    titleKey: 'views.dev.byte.title',
    descriptionKey: 'views.dev.byte.description',
    icon: Database
  },
  {
    path: '/develop/radix',
    titleKey: 'views.dev.radix.title',
    descriptionKey: 'views.dev.radix.description',
    icon: Binary
  },
  {
    path: '/develop/roman',
    titleKey: 'views.dev.roman.title',
    descriptionKey: 'views.dev.roman.description',
    icon: Hash
  },
  {
    path: '/develop/color',
    titleKey: 'views.dev.color.title',
    descriptionKey: 'views.dev.color.description',
    icon: Palette
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
