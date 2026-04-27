<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { normalizeServerExpireMs, useCaptchaSendCooldown } from '@/composables/useCaptchaSendCooldown'
import { CaptchaTypeEnum } from '@/definitions/enums/captcha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pu_v1_captcha_generate, pu_v1_captcha_verify } from '@/fetch/captcha/index'
import { pu_v1_login } from '@/fetch/login/index'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:submitting': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const userStore = useUserStore()

const sendingCaptcha = ref(false)

const captchaSchema = computed(() =>
  toTypedSchema(
    z.object({
      email: z
        .string()
        .trim()
        .check(z.email({ error: t('views.user.login.errEmail') })),
      captcha: z.string().regex(/^\d{6}$/, t('views.user.login.errCaptcha'))
    })
  )
)

const captchaForm = useForm({
  name: 'login_captcha_form',
  validationSchema: captchaSchema,
  initialValues: {
    email: '',
    captcha: ''
  }
})

// 验证码发送冷却
const loginCooldown = useCaptchaSendCooldown(
  CaptchaTypeEnum.LOGIN,
  computed(() => captchaForm.values.email || '')
)
const captchaRemainingSec = loginCooldown.remainingSec
const captchaSendingLocked = loginCooldown.sendingLocked
const emailTrimmed = computed(() => (captchaForm.values.email || '').trim().toLowerCase())

const canSendCaptcha = computed(() => !!emailTrimmed.value && !captchaSendingLocked.value && !sendingCaptcha.value)

const captchaDigits = computed({
  get: () => captchaForm.values.captcha || '',
  set: (raw: string | number) => {
    captchaForm.setFieldValue('captcha', String(raw).replace(/\D/g, '').slice(0, 6))
  }
})

// 发送验证码
const onSendCaptcha = async () => {
  if (!canSendCaptcha.value) return
  sendingCaptcha.value = true
  try {
    const res = await pu_v1_captcha_generate({
      type: CaptchaTypeEnum.LOGIN,
      email: emailTrimmed.value
    })
    if (res.code === ResponseCodeEnum.SUCCESS && res.data?.cache_id) {
      loginCooldown.onSendSuccess(res.data.cache_id, normalizeServerExpireMs(res.data.expire))
      toast.success(t('views.user.login.sendCaptchaSuccess'))
    }
  } finally {
    sendingCaptcha.value = false
  }
}

const onSubmit = captchaForm.handleSubmit(async (submittedValues) => {
  const cacheId = loginCooldown.getCacheId()
  if (!cacheId) {
    toast.error(t('views.user.login.needSendCaptcha'))
    return
  }

  emit('update:submitting', true)
  try {
    // 验证验证码
    const verifyRes = await pu_v1_captcha_verify({
      email: submittedValues.email.trim(),
      type: CaptchaTypeEnum.LOGIN,
      cache_id: cacheId,
      captcha: submittedValues.captcha
    })
    if (verifyRes.code !== ResponseCodeEnum.SUCCESS) return

    // 登录
    const res = await pu_v1_login({
      email: submittedValues.email.trim(),
      cache_id: cacheId
    })
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      userStore.setUserInfo(res.data)
      toast.success(t('views.user.login.loginSuccess'))
      emit('success')
    }
  } finally {
    emit('update:submitting', false)
  }
})
</script>

<template>
  <Form name="login_captcha_form" @submit="onSubmit">
    <FormField v-slot="{ componentField, errors }" name="email">
      <FormLabel for="login-email" required>{{ t('views.user.login.email') }}</FormLabel>
      <FormControl>
        <Input
          id="login-email"
          v-bind="componentField"
          type="email"
          autocomplete="email"
          :aria-invalid="Boolean(errors[0]) || undefined"
          aria-describedby="login-email-message"
          :placeholder="t('views.user.login.emailPlaceholder')"
        />
      </FormControl>
      <FormMessage id="login-email-message">{{ errors[0] }}</FormMessage>
    </FormField>

    <FormField v-slot="{ errors }" name="captcha">
      <FormLabel for="login-captcha" required>{{ t('views.user.login.captcha') }}</FormLabel>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
        <FormControl>
          <Input
            id="login-captcha"
            v-model="captchaDigits"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            class="sm:flex-1"
            :aria-invalid="Boolean(errors[0]) || undefined"
            aria-describedby="login-captcha-message"
            :placeholder="t('views.user.login.captchaPlaceholder')"
          />
        </FormControl>
        <Button
          type="button"
          variant="secondary"
          class="shrink-0 sm:self-start"
          :disabled="!canSendCaptcha"
          @click="onSendCaptcha"
        >
          {{
            captchaSendingLocked
              ? t('views.user.login.resendIn', { sec: captchaRemainingSec })
              : t('views.user.login.sendCaptcha')
          }}
        </Button>
      </div>
      <FormMessage id="login-captcha-message">{{ errors[0] }}</FormMessage>
    </FormField>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button type="submit" class="sm:flex-1" :disabled="props.submitting">{{ t('views.user.login.submit') }}</Button>
      <Button type="button" variant="outline" class="sm:flex-1" as-child>
        <RouterLink to="/user/register">{{ t('views.user.login.goRegister') }}</RouterLink>
      </Button>
    </div>
  </Form>
</template>
