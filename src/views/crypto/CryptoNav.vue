<script setup lang="ts">
import ModuleNavPage from '@/components/common/ModuleNavPage.vue'

const features = [
  {
    path: '/crypto/md5',
    titleKey: 'views.crypto.md5.title',
    descriptionKey: 'views.crypto.md5.description'
  },
  {
    path: '/crypto/base64',
    titleKey: 'views.crypto.base64.title',
    descriptionKey: 'views.crypto.base64.description'
  },
  {
    path: '/crypto/jwt',
    titleKey: 'views.crypto.jwt.title',
    descriptionKey: 'views.crypto.jwt.description'
  },
  {
    path: '/crypto/sm2',
    titleKey: 'views.crypto.sm2.title',
    descriptionKey: 'views.crypto.sm2.description'
  },
  {
    path: '/crypto/sm4',
    titleKey: 'views.crypto.sm4.title',
    descriptionKey: 'views.crypto.sm4.description'
  },
  {
    path: '/crypto/aes',
    titleKey: 'views.crypto.aes.title',
    descriptionKey: 'views.crypto.aes.description'
  },
  {
    path: '/crypto/des',
    titleKey: 'views.crypto.des.title',
    descriptionKey: 'views.crypto.des.description'
  }
]
</script>

<template>
  <ModuleNavPage
    module-title-key="layout.nav.modules.crypto"
    module-description-key="layout.nav.modules.cryptoDescription"
    :features="features"
  />
</template>
