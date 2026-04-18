<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { Button } from '@/components/ui/button'

const { t } = useI18n()
const route = useRoute()

const prefilledAccount = typeof route.query.account === 'string' ? route.query.account : ''
</script>

<template>
  <div class="flex min-h-[min(480px,calc(100vh-8rem))] flex-1 flex-col items-center justify-center px-4 py-4">
    <div
      class="border-border/60 bg-transparent flex w-full max-w-md flex-col gap-6 rounded-xl border p-6 shadow-sm sm:p-8"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.user.resetPassword.title') }}</h1>
        <p class="text-muted-foreground text-sm">{{ t('views.user.resetPassword.description') }}</p>
        <p v-if="prefilledAccount" class="text-muted-foreground text-xs">
          {{ t('views.user.resetPassword.prefillHint', { account: prefilledAccount }) }}
        </p>
      </div>

      <Button variant="outline" as-child>
        <RouterLink to="/user/login">{{ t('views.user.resetPassword.backLogin') }}</RouterLink>
      </Button>
    </div>
  </div>
</template>
