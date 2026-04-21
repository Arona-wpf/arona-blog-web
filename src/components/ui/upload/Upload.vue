<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_file_upload } from '@/fetch/file/index'

type UploadType = 'image' | 'file'

const props = withDefaults(
  defineProps<{
    /** 当前上传的文件 object_name (v-model) */
    modelValue?: string | null
    /** 接受的文件类型 */
    accept?: string
    /** 上传类型，传给后端 API */
    type?: UploadType
    /** 最大文件大小 (MB) */
    maxSize?: number
    /** 是否禁用 */
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    accept: '*',
    type: 'file',
    maxSize: 10,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'success', value: { objectName: string }): void
  (e: 'error', error: Error): void
}>()

const { t } = useI18n()
const inputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const isDisabled = computed(() => props.disabled || uploading.value)

/** 触发文件选择 */
function triggerUpload() {
  if (isDisabled.value) return
  inputRef.value?.click()
}

/** 文件选择变化 */
async function handleChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // 清空 input，以便重复选择同一文件
  input.value = ''

  // 校验文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    toast.error(t('components.upload.maxSizeError', { size: props.maxSize }))
    return
  }

  uploading.value = true
  toast.info(t('components.upload.uploading'))

  try {
    const res = await pr_v1_file_upload({ file, type: props.type })
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      // 存储 object_name，不是完整 URL
      emit('update:modelValue', res.data.object_name)
      emit('success', { objectName: res.data.object_name })
      toast.success(t('components.upload.uploadSuccess'))
    } else {
      toast.error(t('components.upload.uploadFailed'))
    }
  } catch (error) {
    emit('error', error instanceof Error ? error : new Error('Upload failed'))
    toast.error(t('components.upload.uploadFailed'))
  } finally {
    uploading.value = false
  }
}

defineExpose({
  triggerUpload,
  uploading
})
</script>

<template>
  <div class="inline-block">
    <slot :uploading="uploading" :trigger-upload="triggerUpload" :disabled="isDisabled" />
    <input ref="inputRef" type="file" :accept="accept" class="hidden" :disabled="isDisabled" @change="handleChange" />
  </div>
</template>
