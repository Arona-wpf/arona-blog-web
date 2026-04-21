<script setup lang="ts">
import { CalendarDate, type DateValue, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { toTypedSchema } from '@vee-validate/zod'
import { CalendarDays } from 'lucide-vue-next'
import { Field, useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import * as z from 'zod'

import defaultAvatar from '@/assets/jpg/arona.jpg'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UploadAvatar } from '@/components/ui/upload'
import { GenderEnum } from '@/definitions/enums/common.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_user_update_profile } from '@/fetch/user/index'
import { useUserStore } from '@/stores/user'

const MIN_BIRTHDAY = new CalendarDate(1900, 1, 1)

const { t } = useI18n()
const userStore = useUserStore()
const submitting = ref(false)
const birthdayOpen = ref(false)
const avatarObjectName = ref<string | null>(null)

const userInfo = computed(() => userStore.userInfo)

// 初始化头像 object_name
avatarObjectName.value = userInfo.value?.avatar || null

const formSchema = computed(() =>
  toTypedSchema(
    z.object({
      nickname: z.string().trim().max(20, t('views.user.profile.errNickname')),
      gender: z.enum(GenderEnum),
      birthday: z.string().min(1, t('views.user.profile.errBirthday'))
    })
  )
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    nickname: userInfo.value?.nickname || '',
    gender: userInfo.value?.gender || GenderEnum.SECRET,
    birthday: userInfo.value?.birthday || ''
  }
})

const values = form.values
const todayValue = computed(() => today(getLocalTimeZone()))

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

const onSubmit = form.handleSubmit(async (submittedValues) => {
  if (submitting.value) return
  submitting.value = true

  try {
    const res = await pr_v1_user_update_profile({
      nickname: submittedValues.nickname.trim(),
      avatar: avatarObjectName.value || undefined,
      gender: submittedValues.gender,
      birthday: submittedValues.birthday
    })

    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      userStore.setUserInfo(res.data)
      avatarObjectName.value = res.data.avatar || null
      toast.success(t('views.user.profile.success'))
    }
  } finally {
    submitting.value = false
  }
})

/** 重置表单为当前用户信息 */
function handleReset() {
  avatarObjectName.value = userInfo.value?.avatar || null
  form.resetForm({
    values: {
      nickname: userInfo.value?.nickname || '',
      gender: userInfo.value?.gender || GenderEnum.SECRET,
      birthday: userInfo.value?.birthday || ''
    }
  })
}

/** 头像上传成功 */
function handleAvatarSuccess(data: { objectName: string }) {
  avatarObjectName.value = data.objectName
}
</script>

<template>
  <div class="flex min-h-[min(640px,calc(100vh-8rem))] flex-1 flex-col items-center justify-center px-4">
    <div
      class="border-border/60 bg-transparent flex w-full max-w-md flex-col justify-center gap-8 rounded-xl border p-6 shadow-sm sm:p-8"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.user.profile.title') }}</h1>
        <p class="text-muted-foreground text-sm">{{ t('views.user.profile.subtitle') }}</p>
      </div>

      <!-- 用户头像 -->
      <div class="flex items-center gap-4">
        <UploadAvatar
          v-model="avatarObjectName"
          :default-src="defaultAvatar"
          size="lg"
          @success="handleAvatarSuccess"
        />
        <div class="space-y-1">
          <p class="font-medium">{{ userInfo?.nickname }}</p>
          <p class="text-muted-foreground text-sm">{{ userInfo?.account }}</p>
        </div>
      </div>

      <!-- 头像上传提示 -->
      <p class="text-muted-foreground text-xs">
        {{ t('views.user.profile.avatarTip') }}
      </p>

      <Form @submit="onSubmit">
        <!-- 账号（只读） -->
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ t('views.user.profile.account') }}</label>
          <Input :model-value="userInfo?.account" readonly class="bg-muted/50" />
        </div>

        <!-- 昵称 -->
        <Field v-slot="{ componentField, errors }" name="nickname">
          <FormLabel for="profile-nickname">{{ t('views.user.profile.nickname') }}</FormLabel>
          <FormControl>
            <Input
              id="profile-nickname"
              v-bind="componentField"
              maxlength="20"
              autocomplete="nickname"
              :aria-invalid="Boolean(errors[0]) || undefined"
              aria-describedby="profile-nickname-message"
              :placeholder="t('views.user.profile.nicknamePlaceholder')"
            />
          </FormControl>
          <FormMessage id="profile-nickname-message">{{ errors[0] }}</FormMessage>
        </Field>

        <!-- 性别 -->
        <Field v-slot="{ errors }" name="gender">
          <FormLabel for="profile-gender">{{ t('views.user.profile.gender') }}</FormLabel>
          <RadioGroup
            :model-value="values.gender"
            class="flex flex-wrap gap-x-6 gap-y-3"
            @update:model-value="(v) => form.setFieldValue('gender', v as GenderEnum)"
          >
            <div class="flex items-center gap-2">
              <RadioGroupItem id="profile-gender-male" :value="GenderEnum.MALE" />
              <label class="text-sm leading-none" for="profile-gender-male">{{
                t('views.user.profile.genderMale')
              }}</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="profile-gender-female" :value="GenderEnum.FEMALE" />
              <label class="text-sm leading-none" for="profile-gender-female">{{
                t('views.user.profile.genderFemale')
              }}</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="profile-gender-secret" :value="GenderEnum.SECRET" />
              <label class="text-sm leading-none" for="profile-gender-secret">{{
                t('views.user.profile.genderSecret')
              }}</label>
            </div>
          </RadioGroup>
          <FormMessage id="profile-gender-message">{{ errors[0] }}</FormMessage>
        </Field>

        <!-- 生日 -->
        <Field v-slot="{ errors }" name="birthday">
          <FormLabel required>{{ t('views.user.profile.birthday') }}</FormLabel>
          <Popover v-model:open="birthdayOpen">
            <PopoverTrigger as-child>
              <Button
                id="profile-birthday"
                type="button"
                variant="outline"
                class="border-input m-0 w-full justify-start font-normal shadow-xs"
                :aria-invalid="Boolean(errors[0]) || undefined"
                aria-describedby="profile-birthday-message"
              >
                <CalendarDays class="mr-2 size-4 opacity-60" />
                <span :class="values.birthday ? '' : 'text-muted-foreground'">{{
                  values.birthday || t('views.user.profile.birthdayPlaceholder')
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
          <FormMessage id="profile-birthday-message">{{ errors[0] }}</FormMessage>
        </Field>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit" class="sm:flex-1" :disabled="submitting">{{ t('views.user.profile.submit') }}</Button>
          <Button type="button" variant="outline" class="sm:flex-1" :disabled="submitting" @click="handleReset">
            {{ t('views.user.profile.reset') }}
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>
