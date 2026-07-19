<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollBody,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_user_create, pr_v1_user_update } from '@/fetch/user'
import type { UserListItem } from '@/fetch/user/types'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  user: UserListItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const submitting = ref(false)

// 角色选项（固定值）
const roleOptions = [
  { value: 'administrator', label: () => t('views.manage.user.roleAdministrator') },
  { value: 'user', label: () => t('views.manage.user.roleUser') }
]

// 表单验证
const formSchema = computed(() =>
  toTypedSchema(
    z.object({
      account: z.string().trim().min(3, t('views.manage.user.errAccount')).max(20, t('views.manage.user.errAccount')),
      password:
        props.mode === 'create'
          ? z.string().min(8, t('views.manage.user.errPassword')).max(30, t('views.manage.user.errPassword'))
          : z
              .string()
              .min(8, t('views.manage.user.errPassword'))
              .max(30, t('views.manage.user.errPassword'))
              .optional()
              .or(z.literal('')),
      nickname: z
        .string()
        .trim()
        .min(1, t('views.manage.user.errNickname'))
        .max(20, t('views.manage.user.errNickname')),
      email: z.string().email(t('views.manage.user.errEmail')),
      birthday: z.string().min(1, t('views.manage.user.errBirthday')),
      gender: z.string().min(1, t('views.manage.user.errGender')),
      roles: z.string().min(1, t('views.manage.user.rolesPlaceholder'))
    })
  )
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    account: '',
    password: '',
    nickname: '',
    email: '',
    birthday: '',
    gender: '',
    roles: 'user'
  }
})

// 监听对话框打开，初始化表单
watch(
  () => props.open,
  (open) => {
    if (open) {
      if (props.mode === 'edit' && props.user) {
        form.resetForm({
          values: {
            account: props.user.account,
            password: '',
            nickname: props.user.nickname,
            email: props.user.email,
            birthday: props.user.birthday,
            gender: props.user.gender,
            roles: props.user.roles?.[0] || 'user'
          }
        })
      } else {
        form.resetForm({
          values: {
            account: '',
            password: '',
            nickname: '',
            email: '',
            birthday: '',
            gender: '',
            roles: 'user'
          }
        })
      }
    }
  }
)

// 提交表单
const onSubmit = form.handleSubmit(async (values) => {
  if (submitting.value) return

  submitting.value = true
  try {
    const rolesArray = values.roles ? [values.roles] : []

    if (props.mode === 'create') {
      const res = await pr_v1_user_create({
        account: values.account,
        password: values.password,
        nickname: values.nickname,
        email: values.email,
        birthday: values.birthday,
        gender: values.gender as any,
        roles: rolesArray
      })
      if (res.code === ResponseCodeEnum.SUCCESS) {
        toast.success(t('views.manage.user.createSuccess'))
        emit('update:open', false)
        emit('success')
      }
    } else if (props.user) {
      const res = await pr_v1_user_update({
        _id: props.user._id,
        nickname: values.nickname,
        email: values.email,
        birthday: values.birthday,
        gender: values.gender as any,
        password: values.password || undefined,
        roles: rolesArray
      })
      if (res.code === ResponseCodeEnum.SUCCESS) {
        toast.success(t('views.manage.user.updateSuccess'))
        emit('update:open', false)
        emit('success')
      }
    }
  } finally {
    submitting.value = false
  }
})

// 关闭对话框
function handleOpenChange(open: boolean) {
  if (!submitting.value) {
    emit('update:open', open)
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="flex max-h-[90vh] flex-col sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {{ props.mode === 'create' ? t('views.manage.user.create') : t('views.manage.user.edit') }}
        </DialogTitle>
        <DialogDescription>
          {{ props.mode === 'create' ? t('views.manage.user.subtitle') : t('views.manage.user.subtitle') }}
        </DialogDescription>
      </DialogHeader>

      <Form class="flex min-h-0 flex-1 flex-col" name="userForm" @submit="onSubmit">
        <DialogScrollBody class="space-y-4">
          <FormField v-slot="{ componentField, errors }" name="account">
            <FormLabel :required="props.mode === 'create'">{{ t('views.manage.user.account') }}</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                :disabled="props.mode === 'edit'"
                maxlength="20"
                :aria-invalid="Boolean(errors[0]) || undefined"
                :placeholder="t('views.manage.user.accountPlaceholder')"
              />
            </FormControl>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="password">
            <FormLabel :required="props.mode === 'create'">{{ t('views.manage.user.password') }}</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="password"
                maxlength="30"
                :aria-invalid="Boolean(errors[0]) || undefined"
                :placeholder="t('views.manage.user.passwordPlaceholder')"
              />
            </FormControl>
            <p v-if="props.mode === 'edit'" class="text-muted-foreground text-xs">
              {{ t('views.manage.user.passwordOptional') }}
            </p>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="nickname">
            <FormLabel required>{{ t('views.manage.user.nickname') }}</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                maxlength="20"
                :aria-invalid="Boolean(errors[0]) || undefined"
                :placeholder="t('views.manage.user.nicknamePlaceholder')"
              />
            </FormControl>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="email">
            <FormLabel required>{{ t('views.manage.user.email') }}</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="email"
                :aria-invalid="Boolean(errors[0]) || undefined"
                :placeholder="t('views.manage.user.emailPlaceholder')"
              />
            </FormControl>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="birthday">
            <FormLabel required>{{ t('views.manage.user.birthday') }}</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="date" :aria-invalid="Boolean(errors[0]) || undefined" />
            </FormControl>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="gender">
            <FormLabel required>{{ t('views.manage.user.gender') }}</FormLabel>
            <Select v-bind="componentField">
              <SelectTrigger :aria-invalid="Boolean(errors[0]) || undefined">
                <SelectValue :placeholder="t('views.manage.user.gender')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{{ t('views.manage.user.genderMale') }}</SelectItem>
                <SelectItem value="female">{{ t('views.manage.user.genderFemale') }}</SelectItem>
                <SelectItem value="secret">{{ t('views.manage.user.genderSecret') }}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="roles">
            <FormLabel required>{{ t('views.manage.user.roles') }}</FormLabel>
            <Select v-bind="componentField">
              <SelectTrigger :aria-invalid="Boolean(errors[0]) || undefined">
                <SelectValue :placeholder="t('views.manage.user.rolesPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="role in roleOptions" :key="role.value" :value="role.value">
                  {{ role.label() }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>
        </DialogScrollBody>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="submitting" @click="handleOpenChange(false)">
            {{ t('global.action.close') }}
          </Button>
          <Button type="submit" :loading="submitting" :disabled="submitting">
            {{ props.mode === 'create' ? t('views.manage.user.create') : t('views.manage.user.edit') }}
          </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
