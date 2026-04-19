<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_user_change_password } from '@/fetch/user/index'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const submitting = ref(false)

const userInfo = computed(() => userStore.userInfo)

const formSchema = computed(() =>
  toTypedSchema(
    z
      .object({
        old_password: z.string().min(1, t('views.user.password.errOldPasswordRequired')),
        new_password: z
          .string()
          .min(8, t('views.user.password.errNewPassword'))
          .max(30, t('views.user.password.errNewPassword')),
        confirm_password: z.string().min(1, t('views.user.password.errConfirmPasswordRequired'))
      })
      .superRefine((values, ctx) => {
        if (values.new_password !== values.confirm_password) {
          ctx.addIssue({
            code: 'custom',
            path: ['confirm_password'],
            message: t('views.user.password.errConfirmPassword')
          })
        }
        if (values.old_password === values.new_password) {
          ctx.addIssue({
            code: 'custom',
            path: ['new_password'],
            message: t('views.user.password.errSamePassword')
          })
        }
      })
  )
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    old_password: '',
    new_password: '',
    confirm_password: ''
  }
})

const onSubmit = form.handleSubmit(async (submittedValues) => {
  if (submitting.value) return
  submitting.value = true

  try {
    const res = await pr_v1_user_change_password({
      old_password: submittedValues.old_password,
      new_password: submittedValues.new_password,
      confirm_password: submittedValues.confirm_password
    })

    if (res.code === ResponseCodeEnum.SUCCESS) {
      toast.success(t('views.user.password.success'))
      // 清除用户信息，强制退出
      userStore.clearUserInfo()
      // 跳转到登录页
      router.push('/user/login')
    }
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <div class="flex min-h-[min(480px,calc(100vh-8rem))] flex-1 flex-col items-center justify-center px-4">
    <div
      class="border-border/60 bg-transparent flex w-full max-w-md flex-col justify-center gap-8 rounded-xl border p-6 shadow-sm sm:p-8"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.user.password.title') }}</h1>
        <p class="text-muted-foreground text-sm">{{ t('views.user.password.subtitle') }}</p>
      </div>

      <!-- 用户信息展示 -->
      <div class="flex items-center gap-4">
        <Avatar class="size-12">
          <AvatarImage :src="userInfo?.avatar" :alt="userInfo?.nickname" />
          <AvatarFallback>{{ userInfo?.nickname?.slice(0, 2) || 'U' }}</AvatarFallback>
        </Avatar>
        <div class="space-y-1">
          <p class="font-medium">{{ userInfo?.nickname }}</p>
          <p class="text-muted-foreground text-sm">{{ userInfo?.account }}</p>
        </div>
      </div>

      <Form @submit="onSubmit">
        <!-- 旧密码 -->
        <Field v-slot="{ componentField, errors }" name="old_password">
          <FormLabel for="password-old" required>{{ t('views.user.password.oldPassword') }}</FormLabel>
          <FormControl>
            <Input
              id="password-old"
              v-bind="componentField"
              type="password"
              autocomplete="current-password"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="password-old-message"
              :placeholder="t('views.user.password.oldPasswordPlaceholder')"
            />
          </FormControl>
          <FormMessage id="password-old-message">{{ errors[0] }}</FormMessage>
        </Field>

        <!-- 新密码 -->
        <Field v-slot="{ componentField, errors }" name="new_password">
          <FormLabel for="password-new" required>{{ t('views.user.password.newPassword') }}</FormLabel>
          <FormControl>
            <Input
              id="password-new"
              v-bind="componentField"
              type="password"
              autocomplete="new-password"
              maxlength="30"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="password-new-message"
              :placeholder="t('views.user.password.newPasswordPlaceholder')"
            />
          </FormControl>
          <FormMessage id="password-new-message">{{ errors[0] }}</FormMessage>
        </Field>

        <!-- 确认密码 -->
        <Field v-slot="{ componentField, errors }" name="confirm_password">
          <FormLabel for="password-confirm" required>{{ t('views.user.password.confirmPassword') }}</FormLabel>
          <FormControl>
            <Input
              id="password-confirm"
              v-bind="componentField"
              type="password"
              autocomplete="new-password"
              maxlength="30"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="password-confirm-message"
              :placeholder="t('views.user.password.confirmPasswordPlaceholder')"
            />
          </FormControl>
          <FormMessage id="password-confirm-message">{{ errors[0] }}</FormMessage>
        </Field>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit" class="sm:flex-1" :disabled="submitting">{{ t('views.user.password.submit') }}</Button>
          <Button type="button" variant="outline" class="sm:flex-1" as-child>
            <RouterLink to="/user/profile">{{ t('views.user.password.goProfile') }}</RouterLink>
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>
