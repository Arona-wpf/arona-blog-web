<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-2">
    <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.text.articles.title') }}</h1>
    <p class="text-muted-foreground text-sm">{{ t('views.text.articles.description') }}</p>
  </div>
</template>
