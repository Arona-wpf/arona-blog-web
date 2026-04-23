<script setup lang="ts">
import { Home, RotateCcw } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import errorGif from '@/assets/gif/error.gif'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="flex min-h-[min(640px,calc(100vh-8rem))] flex-1 flex-col items-center justify-center px-4">
    <div class="flex w-full max-w-lg flex-col items-center gap-6">
      <!-- Error GIF -->
      <img :src="errorGif" alt="404" class="h-48 w-48 object-contain sm:h-64 sm:w-64" draggable="false" />

      <!-- 标题和描述 -->
      <div class="space-y-2 text-center">
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{{ t('views.error.notFound.title') }}</h1>
        <p class="text-muted-foreground text-base sm:text-lg">{{ t('views.error.notFound.description') }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button class="gap-2" @click="goHome">
          <Home class="size-4" />
          {{ t('views.error.notFound.goHome') }}
        </Button>
        <Button variant="outline" class="gap-2" @click="goBack">
          <RotateCcw class="size-4" />
          {{ t('views.error.notFound.goBack') }}
        </Button>
      </div>
    </div>
  </div>
</template>
