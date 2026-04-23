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

const props = defineProps<{
  email: string
  maskedEmail: string
  submitting: boolean
}>()

const emit = defineEmits<{
  next: [cacheId: string]
  prev: []
}>()

const { t } = useI18n()

const sendingCaptcha = ref(false)

const step2Schema = computed(() =>
  toTypedSchema(
    z.object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .check(z.email({ error: t('views.user.resetPassword.errEmail') })),
      captcha: z.string().regex(/^\d{6}$/, t('views.user.resetPassword.errCaptcha'))
    })
  )
)

const step2Form = useForm({
  name: 'reset_step_2_form',
  validationSchema: step2Schema,
  initialValues: {
    email: '',
    captcha: ''
  }
})

// 验证码发送冷却
const resetCooldown = useCaptchaSendCooldown(
  CaptchaTypeEnum.RESET_PASSWORD,
  computed(() => step2Form.values.email || '')
)
const captchaRemainingSec = resetCooldown.remainingSec
const captchaSendingLocked = resetCooldown.sendingLocked
const emailTrimmed = computed(() => (step2Form.values.email || '').trim().toLowerCase())

const canSendCaptcha = computed(() => !!emailTrimmed.value && !captchaSendingLocked.value && !sendingCaptcha.value)

const captchaDigits = computed({
  get: () => step2Form.values.captcha || '',
  set: (raw: string | number) => {
    step2Form.setFieldValue('captcha', String(raw).replace(/\D/g, '').slice(0, 6))
  }
})

// 发送验证码
const onSendCaptcha = async () => {
  if (!canSendCaptcha.value) return
  sendingCaptcha.value = true
  try {
    const res = await pu_v1_captcha_generate({
      type: CaptchaTypeEnum.RESET_PASSWORD,
      email: emailTrimmed.value
    })
    if (res.code === ResponseCodeEnum.SUCCESS && res.data?.cache_id) {
      resetCooldown.onSendSuccess(res.data.cache_id, normalizeServerExpireMs(res.data.expire))
      toast.success(t('views.user.resetPassword.sendCaptchaSuccess'))
    }
  } finally {
    sendingCaptcha.value = false
  }
}

const onNext = step2Form.handleSubmit(async (submittedValues) => {
  const cacheId = resetCooldown.getCacheId()
  if (!cacheId) {
    toast.error(t('views.user.resetPassword.needSendCaptcha'))
    return
  }
  try {
    const verifyRes = await pu_v1_captcha_verify({
      email: submittedValues.email.trim(),
      type: CaptchaTypeEnum.RESET_PASSWORD,
      cache_id: cacheId,
      captcha: submittedValues.captcha
    })
    if (verifyRes.code !== ResponseCodeEnum.SUCCESS) {
      return
    }
    emit('next', cacheId)
  } catch (err) {
    console.error('Step2Email error: ', err)
  }
})

const onPrev = () => {
  emit('prev')
}

// 初始化时设置邮箱
;(() => {
  if (props.email) {
    step2Form.setFieldValue('email', props.email)
  }
})()
</script>

<template>
  <Form name="reset_step_2_form" @submit="onNext">
    <div class="space-y-2">
      <FormLabel for="reset-email">{{ t('views.user.resetPassword.email') }}</FormLabel>
      <FormControl>
        <Input id="reset-email" :value="maskedEmail" readonly class="bg-muted/50" />
      </FormControl>
      <p class="text-muted-foreground text-xs">{{ t('views.user.resetPassword.emailHint') }}</p>
    </div>

    <FormField v-slot="{ errors }" name="captcha" :form="step2Form">
      <FormLabel for="reset-captcha" required>{{ t('views.user.resetPassword.captcha') }}</FormLabel>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start">
        <FormControl class="sm:flex-1">
          <Input
            id="reset-captcha"
            v-model="captchaDigits"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            :aria-invalid="Boolean(errors[0]) || undefined"
            aria-describedby="reset-captcha-message"
            :placeholder="t('views.user.resetPassword.captchaPlaceholder')"
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
              ? t('views.user.resetPassword.resendIn', { sec: captchaRemainingSec })
              : t('views.user.resetPassword.sendCaptcha')
          }}
        </Button>
      </div>
      <FormMessage id="reset-captcha-message">{{ errors[0] }}</FormMessage>
    </FormField>

    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button type="submit" class="sm:flex-1" :disabled="submitting">{{
        t('views.user.resetPassword.nextStep')
      }}</Button>
      <Button type="button" variant="outline" class="sm:flex-1" @click="onPrev">
        {{ t('views.user.resetPassword.prevStep') }}
      </Button>
    </div>
  </Form>
</template>
