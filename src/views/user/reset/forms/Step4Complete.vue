<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'

const { t } = useI18n()
const router = useRouter()

const goLogin = () => {
  router.push('/user/login')
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-4">
    <div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
      <Check class="size-6 text-primary" />
    </div>
    <p class="text-muted-foreground">{{ t('views.user.resetPassword.success') }}</p>
    <Button class="w-full sm:w-auto" @click="goLogin">
      {{ t('views.user.resetPassword.goLogin') }}
    </Button>
  </div>
</template>
