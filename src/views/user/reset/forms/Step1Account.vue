<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pu_v1_user_check_account } from '@/fetch/user/index'

const props = defineProps<{
  prefilledAccount?: string
  submitting: boolean
}>()

const emit = defineEmits<{
  next: [email: string]
}>()

const { t } = useI18n()

const step1Schema = computed(() =>
  toTypedSchema(
    z.object({
      account: z
        .string()
        .trim()
        .regex(/^[a-zA-Z0-9]{3,20}$/, t('views.user.resetPassword.errAccount'))
    })
  )
)

const step1Form = useForm({
  name: 'reset_step_1_form',
  validationSchema: step1Schema,
  initialValues: {
    account: props.prefilledAccount || ''
  }
})

const onNext = step1Form.handleSubmit(async (submittedValues) => {
  try {
    const res = await pu_v1_user_check_account(submittedValues.account.trim())
    if (res.code !== ResponseCodeEnum.SUCCESS) {
      return
    }
    emit('next', res.data.email)
  } catch (err) {
    console.error('Step1Account error: ', err)
  }
})
</script>

<template>
  <Form name="reset_step_1_form" @submit="onNext">
    <FormField v-slot="{ componentField, errors }" name="account">
      <FormLabel for="reset-account" required>{{ t('views.user.resetPassword.account') }}</FormLabel>
      <FormControl>
        <Input
          id="reset-account"
          v-bind="componentField"
          maxlength="20"
          :aria-invalid="Boolean(errors[0]) || undefined"
          aria-describedby="reset-account-message"
          :placeholder="t('views.user.resetPassword.accountPlaceholder')"
        />
      </FormControl>
      <FormMessage id="reset-account-message">{{ errors[0] }}</FormMessage>
    </FormField>

    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button type="button" variant="outline" class="sm:flex-1" as-child>
        <RouterLink to="/user/login">{{ t('views.user.resetPassword.backLogin') }}</RouterLink>
      </Button>
      <Button type="submit" class="sm:flex-1" :disabled="submitting">{{
        t('views.user.resetPassword.nextStep')
      }}</Button>
    </div>
  </Form>
</template>
