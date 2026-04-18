<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { normalizeServerExpireMs, useCaptchaSendCooldown } from '@/composables/useCaptchaSendCooldown'
import { CaptchaTypeEnum } from '@/definitions/enums/captcha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pu_v1_captcha_generate, pu_v1_captcha_verify } from '@/fetch/captcha/index'
import { pu_v1_login } from '@/fetch/login/index'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
type LoginMode = 'password' | 'captcha'
const loginMode = ref<LoginMode>('password')
const submitting = ref(false)
const sendingCaptcha = ref(false)

const formSchema = computed(() =>
  toTypedSchema(
    z
      .object({
        account: z.string().trim().min(1, t('views.user.login.accountPlaceholder')),
        password: z.string().trim(),
        captcha: z.string().trim()
      })
      .superRefine((values, ctx) => {
        if (loginMode.value === 'password' && values.password.length < 1) {
          ctx.addIssue({
            code: 'custom',
            path: ['password'],
            message: t('views.user.login.errPasswordRequired')
          })
        }
        if (loginMode.value === 'captcha' && !/^\d{6}$/.test(values.captcha.trim())) {
          ctx.addIssue({ code: 'custom', path: ['captcha'], message: t('views.user.login.errCaptcha') })
        }
      })
  )
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: { account: '', password: '', captcha: '' }
})

const values = form.values
const loginCooldown = useCaptchaSendCooldown(
  CaptchaTypeEnum.LOGIN,
  computed(() => values.account || '')
)
const loginCaptchaRemainingSec = loginCooldown.remainingSec
const loginCaptchaSendingLocked = loginCooldown.sendingLocked
const accountTrimmed = computed(() => (values.account || '').trim())
const captchaDigits = computed({
  get: () => values.captcha || '',
  set: (raw: string | number) => form.setFieldValue('captcha', String(raw).replace(/\D/g, '').slice(0, 6))
})
const canForgotPassword = computed(() => accountTrimmed.value.length > 0)
const canSendLoginCaptcha = computed(
  () => accountTrimmed.value.length > 0 && !loginCaptchaSendingLocked.value && !sendingCaptcha.value
)

const goResetPassword = () => {
  if (!canForgotPassword.value) return
  router.push({ path: '/user/reset', query: { account: accountTrimmed.value } })
}

const onSendLoginCaptcha = async () => {
  if (!canSendLoginCaptcha.value) return
  sendingCaptcha.value = true
  try {
    const res = await pu_v1_captcha_generate({ type: CaptchaTypeEnum.LOGIN, email: accountTrimmed.value })
    if (res.code === ResponseCodeEnum.SUCCESS && res.data?.cache_id) {
      loginCooldown.onSendSuccess(res.data.cache_id, normalizeServerExpireMs(res.data.expire))
      toast.success(t('views.user.login.sendCaptchaSuccess'))
    }
  } finally {
    sendingCaptcha.value = false
  }
}

const onSubmitLogin = form.handleSubmit(async (submittedValues) => {
  if (submitting.value) return
  submitting.value = true
  try {
    if (loginMode.value === 'password') {
      const res = await pu_v1_login({
        account: submittedValues.account.trim(),
        password: submittedValues.password
      })
      if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
        userStore.setUserInfo(res.data)
        toast.success(t('views.user.login.loginSuccess'))
        await router.push('/')
      }
    } else {
      const cache_id = loginCooldown.getCacheId()
      if (!cache_id) {
        toast.error(t('views.user.login.needSendCaptcha'))
        return
      }

      const verifyRes = await pu_v1_captcha_verify({
        account: submittedValues.account.trim(),
        type: CaptchaTypeEnum.LOGIN,
        cache_id,
        captcha: submittedValues.captcha
      })
      if (verifyRes.code !== ResponseCodeEnum.SUCCESS) return

      const res = await pu_v1_login({
        account: submittedValues.account.trim(),
        cache_id,
        captcha: submittedValues.captcha.trim()
      })
      if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
        userStore.setUserInfo(res.data)
        toast.success(t('views.user.login.loginSuccess'))
        await router.push('/')
      }
    }
  } finally {
    submitting.value = false
  }
})
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

      <Form @submit="onSubmitLogin">
        <Field v-slot="{ componentField, errors }" name="account">
          <FormLabel for="login-account">{{ t('views.user.login.account') }}</FormLabel>
          <FormControl>
            <Input
              id="login-account"
              v-bind="componentField"
              autocomplete="username"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="login-account-message"
              :placeholder="t('views.user.login.accountPlaceholder')"
            />
          </FormControl>
          <FormMessage id="login-account-message">{{ errors[0] }}</FormMessage>
        </Field>

        <template v-if="loginMode === 'password'">
          <Field v-slot="{ componentField, errors }" name="password">
            <FormLabel for="login-password">{{ t('views.user.login.password') }}</FormLabel>
            <FormControl>
              <Input
                id="login-password"
                v-bind="componentField"
                type="password"
                autocomplete="current-password"
                :aria-invalid="Boolean(errors[0]) || undefined"
                aria-describedby="login-password-message"
                :placeholder="t('views.user.login.passwordPlaceholder')"
              />
            </FormControl>
            <FormMessage id="login-password-message">{{ errors[0] }}</FormMessage>
            <div class="flex justify-end">
              <Button
                type="button"
                variant="link"
                class="text-muted-foreground h-auto p-0 text-sm"
                :disabled="!canForgotPassword"
                @click="goResetPassword"
                >{{ t('views.user.login.forgotPassword') }}</Button
              >
            </div>
          </Field>
        </template>

        <template v-else>
          <Field v-slot="{ errors }" name="captcha">
            <FormLabel for="login-captcha">{{ t('views.user.login.captcha') }}</FormLabel>
            <div class="flex gap-2">
              <FormControl>
                <Input
                  id="login-captcha"
                  v-model="captchaDigits"
                  class="flex-1"
                  maxlength="6"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  :aria-invalid="Boolean(errors[0]) || undefined"
                  aria-describedby="login-captcha-message"
                  :placeholder="t('views.user.login.captchaPlaceholder')"
                />
              </FormControl>
              <Button
                type="button"
                variant="secondary"
                class="shrink-0"
                :disabled="!canSendLoginCaptcha"
                @click="onSendLoginCaptcha"
              >
                {{
                  loginCaptchaSendingLocked
                    ? t('views.user.login.resendIn', { sec: loginCaptchaRemainingSec })
                    : t('views.user.login.sendCaptcha')
                }}
              </Button>
            </div>
            <FormMessage id="login-captcha-message">{{ errors[0] }}</FormMessage>
          </Field>
        </template>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit" class="sm:flex-1" :disabled="submitting">{{ t('views.user.login.submit') }}</Button>
          <Button type="button" variant="outline" class="sm:flex-1" as-child>
            <RouterLink to="/user/register">{{ t('views.user.login.goRegister') }}</RouterLink>
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>
