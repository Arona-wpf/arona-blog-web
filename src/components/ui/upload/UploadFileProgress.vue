<script setup lang="ts">
import { File, Upload, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'

type UploadHandler = (
  file: File,
  onProgress: (progress: number) => void
) => Promise<{ success: boolean; data?: any; error?: string }>

const props = withDefaults(
  defineProps<{
    /** 是否禁用 */
    disabled?: boolean
    /** 接受的文件类型 */
    accept?: string
    /** 最大文件大小 (MB) */
    maxSize?: number
    /** 上传处理函数 */
    uploadHandler?: UploadHandler
    /** 是否显示进度条 */
    showProgress?: boolean
    /** 拖拽区域提示文本 */
    dragHint?: string
    /** 文件类型提示文本 */
    fileTypeHint?: string
  }>(),
  {
    disabled: false,
    accept: '.json',
    maxSize: 10,
    uploadHandler: undefined,
    showProgress: true,
    dragHint: undefined,
    fileTypeHint: undefined
  }
)

const emit = defineEmits<{
  (e: 'success', data: any): void
  (e: 'error', error: string): void
  (e: 'fileSelect', file: File): void
  (e: 'fileClear'): void
}>()

const { t } = useI18n()

const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const dragOver = ref(false)

const hasFile = computed(() => selectedFile.value !== null)
const fileName = computed(() => selectedFile.value?.name || '')
const isDisabled = computed(() => props.disabled || uploading.value)

const defaultDragHint = t('components.uploadFile.dragHint')
const defaultFileTypeHint = t('components.uploadFile.fileTypeHint', { accept: props.accept, maxSize: props.maxSize })

function validateAndSetFile(file: File) {
  // 校验文件类型
  const acceptTypes = props.accept.split(',').map((t) => t.trim().toLowerCase())
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  const fileMime = file.type.toLowerCase()

  const isValidType = acceptTypes.some((type) => {
    if (type.startsWith('.')) {
      return fileExt === type
    }
    if (type.includes('*')) {
      const baseType = type.split('/')[0]
      return !!baseType && fileMime.startsWith(baseType)
    }
    return fileMime === type
  })

  if (!isValidType) {
    toast.error(t('components.uploadFile.invalidFileType'))
    return false
  }

  // 校验文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    toast.error(t('components.uploadFile.maxSizeError', { size: props.maxSize }))
    return false
  }

  selectedFile.value = file
  uploadProgress.value = 0
  emit('fileSelect', file)
  return true
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
  input.value = ''
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (!isDisabled.value) {
    dragOver.value = true
  }
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false

  if (isDisabled.value) return

  const file = event.dataTransfer?.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function handleClearFile() {
  selectedFile.value = null
  uploadProgress.value = 0
  emit('fileClear')
}

async function handleUpload() {
  if (!selectedFile.value || uploading.value) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    if (props.uploadHandler) {
      const result = await props.uploadHandler(selectedFile.value, (progress) => {
        uploadProgress.value = progress
      })

      if (result.success) {
        toast.success(t('components.uploadFile.uploadSuccess'))
        emit('success', result.data)
        selectedFile.value = null
        uploadProgress.value = 0
      } else {
        toast.error(result.error || t('components.uploadFile.uploadFailed'))
        emit('error', result.error || 'Upload failed')
      }
    } else {
      emit('success', selectedFile.value)
      selectedFile.value = null
      uploadProgress.value = 0
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Upload failed'
    toast.error(t('components.uploadFile.uploadFailed'))
    emit('error', errorMsg)
  } finally {
    uploading.value = false
  }
}

defineExpose({
  selectedFile,
  uploading,
  uploadProgress,
  handleUpload,
  handleClearFile,
  validateAndSetFile
})
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- 文件拖拽/选择区域 -->
    <div
      class="relative border-2 border-dashed rounded-lg p-6 transition-colors"
      :class="[
        dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        hasFile ? 'border-solid bg-muted/50' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <input
        v-if="!hasFile"
        type="file"
        :accept="accept"
        :title="t('components.uploadFile.selectFile')"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        :disabled="isDisabled"
        @change="handleFileSelect"
      />

      <div v-if="!hasFile" class="flex flex-col items-center justify-center gap-2 text-center">
        <Upload class="size-8 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">
          {{ dragHint || defaultDragHint }}
        </p>
        <p class="text-xs text-muted-foreground/70">
          {{ fileTypeHint || defaultFileTypeHint }}
        </p>
      </div>

      <div v-else class="flex items-center justify-between relative z-10">
        <div class="flex items-center gap-2">
          <File class="size-4 text-muted-foreground" />
          <span class="text-sm truncate max-w-[250px]" :title="fileName">{{ fileName }}</span>
        </div>
        <Button
          v-if="!uploading"
          variant="ghost"
          size="icon-sm"
          :disabled="disabled"
          @click.stop.prevent="handleClearFile"
        >
          <X class="size-3" />
        </Button>
      </div>
    </div>

    <!-- 进度条 -->
    <div v-if="showProgress && uploading" class="space-y-2">
      <div class="h-2 bg-muted rounded-full overflow-hidden">
        <div class="h-full bg-primary transition-all duration-300" :style="{ width: `${uploadProgress}%` }" />
      </div>
      <p class="text-xs text-muted-foreground text-center">
        {{ t('components.uploadFile.uploading', { progress: uploadProgress }) }}
      </p>
    </div>
  </div>
</template>
