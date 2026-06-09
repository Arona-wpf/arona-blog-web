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
import { Textarea } from '@/components/ui/textarea'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_config_create } from '@/fetch/system'

const CONFIG_KEY_PATTERN = /^[a-z]+(\.[a-z]+)*$/

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const submitting = ref(false)

const formSchema = computed(() =>
  toTypedSchema(
    z.object({
      name: z
        .string()
        .trim()
        .min(1, t('views.system.createConfig.errNameRequired'))
        .max(20, t('views.system.createConfig.errNameMax')),
      description: z.string().max(100, t('views.system.createConfig.errDescriptionMax')).optional(),
      key: z
        .string()
        .trim()
        .min(1, t('views.system.createConfig.errKeyRequired'))
        .max(20, t('views.system.createConfig.errKeyMax'))
        .regex(CONFIG_KEY_PATTERN, t('views.system.createConfig.errKeyFormat')),
      value: z.string().max(128, t('views.system.createConfig.errValueMax')).optional()
    })
  )
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    description: '',
    key: '',
    value: ''
  }
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.resetForm({
        values: {
          name: '',
          description: '',
          key: '',
          value: ''
        }
      })
    }
  }
)

function sanitizeKeyInput(value: string) {
  return value.toLowerCase().replace(/[^a-z.]/g, '')
}

const onSubmit = form.handleSubmit(async (values) => {
  if (submitting.value) return

  submitting.value = true
  try {
    const res = await pr_v1_config_create({
      name: values.name.trim(),
      key: values.key.trim(),
      value: values.value?.trim() ?? '',
      description: values.description?.trim() || undefined
    })

    if (res.code === ResponseCodeEnum.SUCCESS) {
      toast.success(res.msg || t('views.system.createConfig.success'))
      emit('update:open', false)
      emit('success')
    }
  } finally {
    submitting.value = false
  }
})

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
        <DialogTitle>{{ t('views.system.createConfig.title') }}</DialogTitle>
        <DialogDescription>{{ t('views.system.createConfig.desc') }}</DialogDescription>
      </DialogHeader>

      <Form class="flex min-h-0 flex-1 flex-col" @submit="onSubmit">
        <DialogScrollBody class="space-y-4">
          <FormField v-slot="{ componentField, errors }" name="name">
            <FormLabel required>{{ t('views.system.createConfig.name') }}</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                maxlength="20"
                :aria-invalid="Boolean(errors[0]) || undefined"
                :placeholder="t('views.system.createConfig.namePlaceholder')"
              />
            </FormControl>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="description">
            <FormLabel>{{ t('views.system.createConfig.description') }}</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                maxlength="100"
                rows="3"
                :aria-invalid="Boolean(errors[0]) || undefined"
                :placeholder="t('views.system.createConfig.descriptionPlaceholder')"
              />
            </FormControl>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="key">
            <FormLabel required>{{ t('views.system.createConfig.key') }}</FormLabel>
            <FormControl>
              <Input
                :model-value="componentField.modelValue"
                maxlength="20"
                autocomplete="off"
                :aria-invalid="Boolean(errors[0]) || undefined"
                :placeholder="t('views.system.createConfig.keyPlaceholder')"
                @update:model-value="(v) => form.setFieldValue('key', sanitizeKeyInput(String(v ?? '')))"
              />
            </FormControl>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>

          <FormField v-slot="{ componentField, errors }" name="value">
            <FormLabel>{{ t('views.system.createConfig.value') }}</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                maxlength="128"
                :aria-invalid="Boolean(errors[0]) || undefined"
                :placeholder="t('views.system.createConfig.valuePlaceholder')"
              />
            </FormControl>
            <FormMessage>{{ errors[0] }}</FormMessage>
          </FormField>
        </DialogScrollBody>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="submitting" @click="handleOpenChange(false)">
            {{ t('views.system.createConfig.cancel') }}
          </Button>
          <Button type="submit" :loading="submitting" :disabled="submitting">
            {{ t('views.system.createConfig.submit') }}
          </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
