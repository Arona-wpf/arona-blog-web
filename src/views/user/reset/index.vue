<script setup lang="ts">
import { Check, KeyRound, Mail, UserCircle } from 'lucide-vue-next'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperTitle,
  StepperTrigger
} from '@/components/ui/stepper'

import Step1Account from './forms/Step1Account.vue'
import Step2Email from './forms/Step2Email.vue'
import Step3Password from './forms/Step3Password.vue'
import Step4Complete from './forms/Step4Complete.vue'

const { t } = useI18n()
const route = useRoute()

const prefilledAccount = typeof route.query.account === 'string' ? route.query.account : ''

const currentStep = ref(1)
const submitting = ref(false)

// 用户信息（步骤1验证后保存）
const userEmail = ref('')
const cacheId = ref('')

// 步骤1完成
const onStep1Next = (email: string) => {
  userEmail.value = email
  currentStep.value = 2
}

// 步骤2完成
const onStep2Next = (id: string) => {
  cacheId.value = id
  currentStep.value = 3
}

// 步骤2返回
const onStep2Prev = () => {
  currentStep.value = 1
}

// 步骤3完成
const onStep3Next = () => {
  currentStep.value = 4
}

// 步骤3返回
const onStep3Prev = () => {
  currentStep.value = 2
}
</script>

<template>
  <div class="flex min-h-[min(600px,calc(100vh-8rem))] flex-1 flex-col items-center justify-center px-4 py-4">
    <div
      class="border-border/60 bg-transparent flex w-full max-w-2xl flex-col gap-6 rounded-xl border p-6 shadow-sm sm:p-8 lg:max-w-3xl"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.user.resetPassword.title') }}</h1>
        <p class="text-muted-foreground text-sm">{{ t('views.user.resetPassword.description') }}</p>
      </div>

      <!-- 步骤条：移动端垂直布局，桌面端水平布局 -->
      <div class="hidden sm:block">
        <Stepper v-model="currentStep" class="w-full justify-start gap-0">
          <StepperItem :step="1" :disabled="currentStep !== 1" class="relative flex-1 basis-1/4">
            <StepperTrigger as-child>
              <div class="flex flex-col items-center gap-1 px-2">
                <StepperIndicator>
                  <UserCircle v-if="currentStep <= 1" class="size-4" />
                  <Check v-else class="size-4" />
                </StepperIndicator>
                <StepperTitle class="text-sm">1.{{ t('views.user.resetPassword.step1Title') }}</StepperTitle>
                <StepperDescription class="hidden lg:block">{{
                  t('views.user.resetPassword.step1Desc')
                }}</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>

          <StepperItem :step="2" :disabled="currentStep !== 2" class="relative flex-1 basis-1/4">
            <StepperTrigger as-child>
              <div class="flex flex-col items-center gap-1 px-2">
                <StepperIndicator>
                  <Mail v-if="currentStep <= 2" class="size-4" />
                  <Check v-else class="size-4" />
                </StepperIndicator>
                <StepperTitle class="text-sm">2.{{ t('views.user.resetPassword.step2Title') }}</StepperTitle>
                <StepperDescription class="hidden lg:block">{{
                  t('views.user.resetPassword.step2Desc')
                }}</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>

          <StepperItem :step="3" :disabled="currentStep !== 3" class="relative flex-1 basis-1/4">
            <StepperTrigger as-child>
              <div class="flex flex-col items-center gap-1 px-2">
                <StepperIndicator>
                  <KeyRound v-if="currentStep <= 3" class="size-4" />
                  <Check v-else class="size-4" />
                </StepperIndicator>
                <StepperTitle class="text-sm">3.{{ t('views.user.resetPassword.step3Title') }}</StepperTitle>
                <StepperDescription class="hidden lg:block">{{
                  t('views.user.resetPassword.step3Desc')
                }}</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>

          <StepperItem :step="4" :disabled="currentStep !== 4" class="relative flex-1 basis-1/4">
            <StepperTrigger as-child>
              <div class="flex flex-col items-center gap-1 px-2">
                <StepperIndicator>
                  <Check class="size-4" />
                </StepperIndicator>
                <StepperTitle class="text-sm">4.{{ t('views.user.resetPassword.step4Title') }}</StepperTitle>
                <StepperDescription class="hidden lg:block">{{
                  t('views.user.resetPassword.step4Desc')
                }}</StepperDescription>
              </div>
            </StepperTrigger>
          </StepperItem>
        </Stepper>
      </div>

      <!-- 移动端步骤指示器 -->
      <div class="flex sm:hidden flex-col items-center gap-2 py-2">
        <span class="text-sm text-muted-foreground">{{
          t('views.user.resetPassword.mobileStepIndicator', { step: currentStep })
        }}</span>
        <span class="text-lg font-semibold text-primary">
          <template v-if="currentStep === 1">{{ t('views.user.resetPassword.step1Title') }}</template>
          <template v-else-if="currentStep === 2">{{ t('views.user.resetPassword.step2Title') }}</template>
          <template v-else-if="currentStep === 3">{{ t('views.user.resetPassword.step3Title') }}</template>
          <template v-else-if="currentStep === 4">{{ t('views.user.resetPassword.step4Title') }}</template>
        </span>
      </div>

      <!-- 步骤1：输入账号 -->
      <Step1Account
        v-if="currentStep === 1"
        :prefilled-account="prefilledAccount"
        :submitting="submitting"
        @next="onStep1Next"
      />

      <!-- 步骤2：验证邮箱 -->
      <Step2Email
        v-if="currentStep === 2 && userEmail.length"
        :email="userEmail"
        :submitting="submitting"
        @next="onStep2Next"
        @prev="onStep2Prev"
      />

      <!-- 步骤3：设置密码 -->
      <Step3Password
        v-if="currentStep === 3"
        :cache-id="cacheId"
        :submitting="submitting"
        @next="onStep3Next"
        @prev="onStep3Prev"
      />

      <!-- 步骤4：完成 -->
      <Step4Complete v-if="currentStep === 4" />
    </div>
  </div>
</template>
