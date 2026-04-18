<script setup lang="ts">
import { CalendarDate, type DateValue, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { toTypedSchema } from '@vee-validate/zod'
import { CalendarDays } from 'lucide-vue-next'
import { Field, useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { normalizeServerExpireMs, useCaptchaSendCooldown } from '@/composables/useCaptchaSendCooldown'
import { CaptchaTypeEnum } from '@/definitions/enums/captcha.enum'
import { GenderEnum } from '@/definitions/enums/common.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pu_v1_captcha_generate, pu_v1_captcha_verify } from '@/fetch/captcha/index'
import { pu_v1_register } from '@/fetch/register/index'

const MIN_BIRTHDAY = new CalendarDate(1900, 1, 1)

const { t } = useI18n()
const router = useRouter()
const submitting = ref(false)
const sendingCaptcha = ref(false)
const birthdayOpen = ref(false)

const formSchema = computed(() =>
  toTypedSchema(
    z
      .object({
        account: z
          .string()
          .trim()
          .regex(/^[a-zA-Z0-9]{3,20}$/, t('views.user.register.errAccount')),
        password: z.string().min(8, t('views.user.register.errPassword')).max(30, t('views.user.register.errPassword')),
        confirmPassword: z.string().min(1, t('views.user.register.errConfirmPasswordRequired')),
        nickname: z
          .string()
          .trim()
          .min(1, t('views.user.register.errNickname'))
          .max(20, t('views.user.register.errNickname')),
        gender: z.enum(GenderEnum),
        birthday: z.string().min(1, t('views.user.register.errBirthday')),
        email: z
          .string()
          .trim()
          .toLowerCase()
          .check(z.email({ error: t('views.user.register.errEmail') })),
        captcha: z.string().regex(/^\d{6}$/, t('views.user.register.errCaptcha'))
      })
      .superRefine((values, ctx) => {
        if (values.password !== values.confirmPassword) {
          ctx.addIssue({
            code: 'custom',
            path: ['confirmPassword'],
            message: t('views.user.register.errConfirmPassword')
          })
        }
      })
  )
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    account: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    gender: GenderEnum.SECRET,
    birthday: '',
    email: '',
    captcha: ''
  }
})

const values = form.values
const registerCooldown = useCaptchaSendCooldown(
  CaptchaTypeEnum.REGISTER,
  computed(() => values.email || '')
)
const registerCaptchaRemainingSec = registerCooldown.remainingSec
const registerCaptchaSendingLocked = registerCooldown.sendingLocked
const emailTrimmed = computed(() => (values.email || '').trim().toLowerCase())
const todayValue = computed(() => today(getLocalTimeZone()))
const canSendRegisterCaptcha = computed(
  () => !!emailTrimmed.value && !registerCaptchaSendingLocked.value && !sendingCaptcha.value
)

const birthdayDateModel = computed<DateValue | undefined>({
  get() {
    if (!values.birthday) return undefined
    try {
      return parseDate(values.birthday)
    } catch {
      return undefined
    }
  },
  set(v) {
    form.setFieldValue('birthday', v ? v.toString() : '')
    if (v) birthdayOpen.value = false
  }
})

const captchaDigits = computed({
  get: () => values.captcha || '',
  set: (raw: string | number) => {
    form.setFieldValue('captcha', String(raw).replace(/\D/g, '').slice(0, 6))
  }
})

const onSendRegisterCaptcha = async () => {
  if (!canSendRegisterCaptcha.value) return
  sendingCaptcha.value = true
  try {
    const res = await pu_v1_captcha_generate({ type: CaptchaTypeEnum.REGISTER, email: emailTrimmed.value })
    if (res.code === ResponseCodeEnum.SUCCESS && res.data?.cache_id) {
      registerCooldown.onSendSuccess(res.data.cache_id, normalizeServerExpireMs(res.data.expire))
      toast.success(t('views.user.login.sendCaptchaSuccess'))
    }
  } finally {
    sendingCaptcha.value = false
  }
}

const onSubmitRegister = form.handleSubmit(async (submittedValues) => {
  if (submitting.value) return
  const cache_id = registerCooldown.getCacheId()
  if (!cache_id) {
    toast.error(t('views.user.register.needEmailCaptcha'))
    return
  }
  submitting.value = true

  try {
    const verifyRes = await pu_v1_captcha_verify({
      email: submittedValues.email.trim(),
      type: CaptchaTypeEnum.REGISTER,
      cache_id,
      captcha: submittedValues.captcha
    })
    if (verifyRes.code !== ResponseCodeEnum.SUCCESS) return

    const registerRes = await pu_v1_register({
      account: submittedValues.account.trim(),
      password: submittedValues.password,
      nickname: submittedValues.nickname.trim(),
      birthday: submittedValues.birthday,
      gender: submittedValues.gender,
      email: submittedValues.email.trim(),
      cache_id
    })
    if (registerRes.code !== ResponseCodeEnum.SUCCESS) return

    toast.success(t('views.user.register.success'))
    router.push('/user/login')
  } catch (err) {
    console.error('onSubmitRegister error: ', err)
    submitting.value = false
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <div class="flex min-h-[min(720px,calc(100vh-8rem))] flex-1 flex-col items-center justify-center px-4">
    <div
      class="border-border/60 bg-transparent flex w-full max-w-md flex-col justify-center gap-8 rounded-xl border p-6 shadow-sm sm:p-8"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.user.register.title') }}</h1>
        <p class="text-muted-foreground text-sm">{{ t('views.user.register.subtitle') }}</p>
      </div>

      <Form @submit="onSubmitRegister">
        <Field v-slot="{ componentField, errors }" name="account">
          <FormLabel for="reg-account" required>{{ t('views.user.register.account') }}</FormLabel>
          <FormControl>
            <Input
              id="reg-account"
              v-bind="componentField"
              autocomplete="username"
              maxlength="20"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="reg-account-message"
              :placeholder="t('views.user.register.accountPlaceholder')"
            />
          </FormControl>
          <FormMessage id="reg-account-message">{{ errors[0] }}</FormMessage>
        </Field>

        <Field v-slot="{ componentField, errors }" name="password">
          <FormLabel for="reg-password" required>{{ t('views.user.register.password') }}</FormLabel>
          <FormControl>
            <Input
              id="reg-password"
              v-bind="componentField"
              type="password"
              autocomplete="new-password"
              maxlength="30"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="reg-password-message"
              :placeholder="t('views.user.register.passwordPlaceholder')"
            />
          </FormControl>
          <FormMessage id="reg-password-message">{{ errors[0] }}</FormMessage>
        </Field>

        <Field v-slot="{ componentField, errors }" name="confirmPassword">
          <FormLabel for="reg-confirm-password" required>{{ t('views.user.register.confirmPassword') }}</FormLabel>
          <FormControl>
            <Input
              id="reg-confirm-password"
              v-bind="componentField"
              type="password"
              autocomplete="new-password"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="reg-confirm-password-message"
              :placeholder="t('views.user.register.confirmPasswordPlaceholder')"
            />
          </FormControl>
          <FormMessage id="reg-confirm-password-message">{{ errors[0] }}</FormMessage>
        </Field>

        <Field v-slot="{ componentField, errors }" name="nickname">
          <FormLabel for="reg-nickname" required>{{ t('views.user.register.nickname') }}</FormLabel>
          <FormControl>
            <Input
              id="reg-nickname"
              v-bind="componentField"
              maxlength="20"
              autocomplete="nickname"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="reg-nickname-message"
              :placeholder="t('views.user.register.nicknamePlaceholder')"
            />
          </FormControl>
          <FormMessage id="reg-nickname-message">{{ errors[0] }}</FormMessage>
        </Field>

        <Field v-slot="{ errors }" name="gender">
          <FormLabel for="reg-gender">{{ t('views.user.register.gender') }}</FormLabel>
          <RadioGroup
            :model-value="values.gender"
            class="flex flex-wrap gap-x-6 gap-y-3"
            @update:model-value="(v) => form.setFieldValue('gender', v as GenderEnum)"
          >
            <div class="flex items-center gap-2">
              <RadioGroupItem id="reg-gender-male" :value="GenderEnum.MALE" />
              <label class="text-sm leading-none" for="reg-gender-male">{{
                t('views.user.register.genderMale')
              }}</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="reg-gender-female" :value="GenderEnum.FEMALE" />
              <label class="text-sm leading-none" for="reg-gender-female">{{
                t('views.user.register.genderFemale')
              }}</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="reg-gender-secret" :value="GenderEnum.SECRET" />
              <label class="text-sm leading-none" for="reg-gender-secret">{{
                t('views.user.register.genderSecret')
              }}</label>
            </div>
          </RadioGroup>
          <FormMessage id="reg-gender-message">{{ errors[0] }}</FormMessage>
        </Field>

        <Field v-slot="{ errors }" name="birthday">
          <FormLabel required>{{ t('views.user.register.birthday') }}</FormLabel>
          <Popover v-model:open="birthdayOpen">
            <PopoverTrigger as-child>
              <Button
                id="reg-birthday"
                type="button"
                variant="outline"
                class="border-input m-0 w-full justify-start font-normal shadow-xs"
                :aria-invalid="Boolean(errors[0]) || undefined"
                aria-describedby="reg-birthday-message"
              >
                <CalendarDays class="mr-2 size-4 opacity-60" />
                <span :class="values.birthday ? '' : 'text-muted-foreground'">{{
                  values.birthday || t('views.user.register.birthdayPlaceholder')
                }}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar
                v-model="birthdayDateModel"
                :min-value="MIN_BIRTHDAY"
                :max-value="todayValue"
                class="rounded-md border-0 shadow-none"
                prevent-deselect
              />
            </PopoverContent>
          </Popover>
          <FormMessage id="reg-birthday-message">{{ errors[0] }}</FormMessage>
        </Field>

        <Field v-slot="{ componentField, errors }" name="email">
          <FormLabel for="reg-email" required>{{ t('views.user.register.email') }}</FormLabel>
          <div class="mb-0 flex items-start gap-2">
            <FormControl>
              <Input
                id="reg-email"
                v-bind="componentField"
                class="flex-1"
                type="email"
                autocomplete="email"
                :aria-invalid="Boolean(errors[0]) || undefined"
                aria-describedby="reg-email-message"
                :placeholder="t('views.user.register.emailPlaceholder')"
              />
            </FormControl>
            <Button
              type="button"
              variant="secondary"
              class="mb-0 shrink-0 self-start"
              :disabled="!canSendRegisterCaptcha"
              @click="onSendRegisterCaptcha"
            >
              {{
                registerCaptchaSendingLocked
                  ? t('views.user.login.resendIn', { sec: registerCaptchaRemainingSec })
                  : t('views.user.login.sendCaptcha')
              }}
            </Button>
          </div>
          <FormMessage id="reg-email-message">{{ errors[0] }}</FormMessage>
        </Field>

        <Field v-slot="{ errors }" name="captcha">
          <FormLabel for="reg-captcha" required>{{ t('views.user.register.captcha') }}</FormLabel>
          <FormControl>
            <Input
              id="reg-captcha"
              v-model="captchaDigits"
              maxlength="6"
              inputmode="numeric"
              autocomplete="one-time-code"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="reg-captcha-message"
              :placeholder="t('views.user.register.captchaPlaceholder')"
            />
          </FormControl>
          <FormMessage id="reg-captcha-message">{{ errors[0] }}</FormMessage>
        </Field>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit" class="sm:flex-1" :disabled="submitting">{{ t('views.user.register.submit') }}</Button>
          <Button type="button" variant="outline" class="sm:flex-1" as-child>
            <RouterLink to="/user/login">{{ t('views.user.register.goLogin') }}</RouterLink>
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>
