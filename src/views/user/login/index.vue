<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'

import CaptchaForm from './forms/CaptchaForm.vue'
import PasswordForm from './forms/PasswordForm.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

type LoginMode = 'password' | 'captcha'
const loginMode = ref<LoginMode>('password')
const submitting = ref(false)

const onLoginSuccess = async () => {
  const redirect = route.query.redirect as string
  await router.push(redirect || '/')
}

const onGoResetPassword = (account?: string) => {
  router.push({ path: '/user/reset', query: account ? { account } : {} })
}
</script>

<template>
  <div class="flex min-h-[min(640px,calc(100vh-8rem))] flex-1 flex-col items-center justify-center px-4">
    <div
      class="border-border/60 bg-transparent flex w-full max-w-md flex-col justify-center gap-8 rounded-xl border p-6 shadow-sm sm:p-8"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.user.login.title') }}</h1>
        <p class="text-muted-foreground text-sm">{{ t('views.user.login.subtitle') }}</p>
      </div>

      <div class="flex rounded-lg border p-1">
        <Button
          type="button"
          :variant="loginMode === 'password' ? 'default' : 'ghost'"
          class="h-8 flex-1"
          @click="loginMode = 'password'"
          >{{ t('views.user.login.modePassword') }}</Button
        >
        <Button
          type="button"
          :variant="loginMode === 'captcha' ? 'default' : 'ghost'"
          class="h-8 flex-1"
          @click="loginMode = 'captcha'"
          >{{ t('views.user.login.modeCaptcha') }}</Button
        >
      </div>

      <PasswordForm
        v-if="loginMode === 'password'"
        :submitting="submitting"
        @update:submitting="submitting = $event"
        @success="onLoginSuccess"
        @go-reset-password="onGoResetPassword"
      />

      <CaptchaForm
        v-if="loginMode === 'captcha'"
        :submitting="submitting"
        @update:submitting="submitting = $event"
        @success="onLoginSuccess"
      />
    </div>
  </div>
</template>
