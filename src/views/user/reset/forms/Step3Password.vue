<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pu_v1_user_reset_password } from '@/fetch/user/index'

const props = defineProps<{
  cacheId: string
  submitting: boolean
}>()

const emit = defineEmits<{
  next: []
  prev: []
}>()

const { t } = useI18n()

const step3Schema = computed(() =>
  toTypedSchema(
    z
      .object({
        password: z
          .string()
          .min(8, t('views.user.resetPassword.errPassword'))
          .max(30, t('views.user.resetPassword.errPassword')),
        confirmPassword: z.string().min(1, t('views.user.resetPassword.errConfirmPasswordRequired'))
      })
      .superRefine((values, ctx) => {
        if (values.password !== values.confirmPassword) {
          ctx.addIssue({
            code: 'custom',
            path: ['confirmPassword'],
            message: t('views.user.resetPassword.errConfirmPassword')
          })
        }
      })
  )
)

const step3Form = useForm({
  name: 'reset_step_3_form',
  validationSchema: step3Schema,
  initialValues: {
    password: '',
    confirmPassword: ''
  }
})

const onSubmit = step3Form.handleSubmit(async (values) => {
  try {
    const res = await pu_v1_user_reset_password({
      cache_id: props.cacheId,
      password: values.password,
      confirm_password: values.confirmPassword
    })
    if (res.code !== ResponseCodeEnum.SUCCESS) {
      return
    }
    toast.success(t('views.user.resetPassword.success'))
    emit('next')
  } catch (err) {
    console.error('Step3Password error: ', err)
  }
})

const onPrev = () => {
  emit('prev')
}
</script>

<template>
  <Form name="reset_step_3_form" @submit="onSubmit">
    <FormField v-slot="{ componentField, errors }" name="password">
      <FormLabel for="reset-password" required>{{ t('views.user.resetPassword.newPassword') }}</FormLabel>
      <FormControl>
        <Input
          id="reset-password"
          v-bind="componentField"
          type="password"
          autocomplete="new-password"
          maxlength="30"
          :aria-invalid="Boolean(errors[0]) || undefined"
          aria-describedby="reset-password-message"
          :placeholder="t('views.user.resetPassword.newPasswordPlaceholder')"
        />
      </FormControl>
      <FormMessage id="reset-password-message">{{ errors[0] }}</FormMessage>
    </FormField>

    <FormField v-slot="{ componentField, errors }" name="confirmPassword" :form="step3Form">
      <FormLabel for="reset-confirm-password" required>{{ t('views.user.resetPassword.confirmPassword') }}</FormLabel>
      <FormControl>
        <Input
          id="reset-confirm-password"
          v-bind="componentField"
          type="password"
          autocomplete="new-password"
          maxlength="30"
          :aria-invalid="Boolean(errors[0]) || undefined"
          aria-describedby="reset-confirm-password-message"
          :placeholder="t('views.user.resetPassword.confirmPasswordPlaceholder')"
        />
      </FormControl>
      <FormMessage id="reset-confirm-password-message">{{ errors[0] }}</FormMessage>
    </FormField>

    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button type="button" variant="outline" class="sm:flex-1" @click="onPrev">
        {{ t('views.user.resetPassword.prevStep') }}
      </Button>
      <Button type="submit" class="sm:flex-1" :disabled="submitting">{{
        t('views.user.resetPassword.nextStep')
      }}</Button>
    </div>
  </Form>
</template>
