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
import { pu_v1_login } from '@/fetch/login/index'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:submitting': [value: boolean]
  success: []
  goResetPassword: [account?: string]
}>()

const { t } = useI18n()
const userStore = useUserStore()

const passwordSchema = computed(() =>
  toTypedSchema(
    z.object({
      account: z.string().trim().min(1, t('views.user.login.accountPlaceholder')),
      password: z.string().trim().min(1, t('views.user.login.errPasswordRequired'))
    })
  )
)

const passwordForm = useForm({
  name: 'login_password_form',
  validationSchema: passwordSchema,
  initialValues: {
    account: '',
    password: ''
  }
})

const onSubmit = passwordForm.handleSubmit(async (submittedValues) => {
  emit('update:submitting', true)
  try {
    const res = await pu_v1_login({
      account: submittedValues.account.trim(),
      password: submittedValues.password
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

const onResetPassword = () => {
  emit('goResetPassword', passwordForm.values.account?.trim())
}
</script>

<template>
  <Form name="login_password_form" @submit="onSubmit">
    <FormField v-slot="{ componentField, errors }" name="account">
      <FormLabel for="login-account" required>{{ t('views.user.login.account') }}</FormLabel>
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
    </FormField>

    <FormField v-slot="{ componentField, errors }" name="password">
      <FormLabel for="login-password" required>{{ t('views.user.login.password') }}</FormLabel>
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
          @click="onResetPassword"
          >{{ t('views.user.login.forgotPassword') }}</Button
        >
      </div>
    </FormField>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button type="submit" class="sm:flex-1" :disabled="props.submitting">
        {{ t('views.user.login.submit') }}
      </Button>
      <Button type="button" variant="outline" class="sm:flex-1" as-child>
        <RouterLink to="/user/register">{{ t('views.user.login.goRegister') }}</RouterLink>
      </Button>
    </div>
  </Form>
</template>
