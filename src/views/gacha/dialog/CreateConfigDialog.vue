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
import { DEFAULT_SERVER_REGION_MAP, SERVER_REGION_I18N_KEY_MAP } from '@/definitions/constants/gacha.constants'
import { GameTypeEnum } from '@/definitions/enums/gacha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import type { GameType } from '@/definitions/types/gacha.types'
import { pr_v1_gacha_config_create, pr_v1_gacha_config_update } from '@/fetch/gacha'
import type { GachaConfig } from '@/fetch/gacha/types'

const props = defineProps<{
  open: boolean
  gameType: GameType
  editMode?: boolean
  editData?: GachaConfig | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()

const submitting = ref(false)

const regionI18nKeys = computed(() => SERVER_REGION_I18N_KEY_MAP[props.gameType] || {})
const defaultRegion = computed(() => DEFAULT_SERVER_REGION_MAP[props.gameType] || '')

const titleKey = computed(() => {
  if (props.editMode) {
    return 'views.gacha.modal.editConfig'
  }
  switch (props.gameType) {
    case GameTypeEnum.GENSHIN_IMPACT:
      return 'views.gacha.genshin.createConfig'
    case GameTypeEnum.HONKAI_STAR_RAIL:
      return 'views.gacha.starrail.createConfig'
    case GameTypeEnum.ZENLESS_ZONE_ZERO:
      return 'views.gacha.zzz.createConfig'
    default:
      return 'views.gacha.createConfig'
  }
})

const descriptionKey = computed(() => {
  if (props.editMode) {
    return 'views.gacha.modal.editDescription'
  }
  return 'views.gacha.modal.description'
})

const formSchema = computed(() =>
  toTypedSchema(
    z.object({
      region: z.string().min(1, t('views.gacha.modal.errRegionRequired')),
      game_uid: z
        .string()
        .min(1, t('views.gacha.modal.errUidRequired'))
        .max(10, t('views.gacha.modal.errUidMax'))
        .regex(/^\d+$/, t('views.gacha.modal.errUidNumber')),
      game_nickname: z
        .string()
        .min(1, t('views.gacha.modal.errNicknameRequired'))
        .max(20, t('views.gacha.modal.errNicknameMax'))
        .regex(/^[a-zA-Z0-9一-龥]+$/, t('views.gacha.modal.errNicknameChar')),
      gacha_url: z.string().optional()
    })
  )
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    region: defaultRegion.value,
    game_uid: '',
    game_nickname: '',
    gacha_url: ''
  }
})

// 监听编辑数据变化，更新表单
watch(
  () => props.editData,
  (data) => {
    if (props.editMode && data) {
      form.setValues({
        region: data.region,
        game_uid: data.game_uid,
        game_nickname: data.game_nickname,
        gacha_url: data.gacha_url || ''
      })
    }
  },
  { immediate: true }
)

// 监听弹窗打开，重置或填充表单
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.editMode && props.editData) {
        form.setValues({
          region: props.editData.region,
          game_uid: props.editData.game_uid,
          game_nickname: props.editData.game_nickname,
          gacha_url: props.editData.gacha_url || ''
        })
      } else {
        form.resetForm()
        form.setFieldValue('region', defaultRegion.value)
      }
    }
  }
)

watch(defaultRegion, (newRegion) => {
  if (!props.editMode) {
    form.setFieldValue('region', newRegion)
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  if (submitting.value) return

  const { valid } = await form.validate()
  if (!valid) return

  submitting.value = true

  try {
    if (props.editMode && props.editData) {
      // 编辑模式：只更新昵称和链接
      const res = await pr_v1_gacha_config_update({
        _id: props.editData._id,
        game_nickname: values.game_nickname,
        gacha_url: values.gacha_url || ''
      })

      if (res.code === ResponseCodeEnum.SUCCESS) {
        toast.success(t('views.gacha.modal.editSuccess'))
        emit('update:open', false)
        emit('success')
      }
    } else {
      // 新建模式
      const res = await pr_v1_gacha_config_create({
        game_type: props.gameType,
        region: values.region,
        game_uid: values.game_uid,
        game_nickname: values.game_nickname,
        gacha_url: values.gacha_url || ''
      })

      if (res.code === ResponseCodeEnum.SUCCESS) {
        toast.success(t('views.gacha.modal.createSuccess'))
        emit('update:open', false)
        emit('success')
        form.resetForm()
      }
    }
  } finally {
    submitting.value = false
  }
})

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleClose">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t(titleKey) }}</DialogTitle>
        <DialogDescription>{{ t(descriptionKey) }}</DialogDescription>
      </DialogHeader>

      <DialogScrollBody>
        <Form name="create_gacha_config_form">
          <div class="space-y-4">
            <FormField v-slot="{ componentField, errors }" name="region">
              <FormLabel required>{{ t('views.gacha.modal.region') }}</FormLabel>
              <FormControl>
                <Select v-bind="componentField" :disabled="props.editMode">
                  <SelectTrigger>
                    <SelectValue :placeholder="t('views.gacha.modal.regionPlaceholder')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="(i18nKey, value) in regionI18nKeys" :key="value" :value="value">
                      {{ t(i18nKey) }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{{ errors[0] }}</FormMessage>
            </FormField>

            <FormField v-slot="{ componentField, errors }" name="game_uid">
              <FormLabel required>{{ t('views.gacha.modal.uid') }}</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="text"
                  maxlength="10"
                  :placeholder="t('views.gacha.modal.uidPlaceholder')"
                  :disabled="props.editMode"
                />
              </FormControl>
              <FormMessage>{{ errors[0] }}</FormMessage>
            </FormField>

            <FormField v-slot="{ componentField, errors }" name="game_nickname">
              <FormLabel required>{{ t('views.gacha.modal.nickname') }}</FormLabel>
              <FormControl :hint="t('views.gacha.modal.nicknameHint')">
                <Input
                  v-bind="componentField"
                  type="text"
                  maxlength="20"
                  :placeholder="t('views.gacha.modal.nicknamePlaceholder')"
                />
              </FormControl>
              <FormMessage>{{ errors[0] }}</FormMessage>
            </FormField>

            <FormField v-slot="{ componentField, errors }" name="gacha_url">
              <FormLabel>{{ t('views.gacha.modal.gachaUrl') }}</FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="text" :placeholder="t('views.gacha.modal.gachaUrlPlaceholder')" />
              </FormControl>
              <FormMessage>{{ errors[0] }}</FormMessage>
            </FormField>
          </div>
        </Form>
      </DialogScrollBody>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">
          {{ t('views.gacha.modal.cancel') }}
        </Button>
        <Button :loading="submitting" :disabled="submitting" @click="onSubmit">
          {{ props.editMode ? t('views.gacha.modal.save') : t('views.gacha.modal.submit') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
