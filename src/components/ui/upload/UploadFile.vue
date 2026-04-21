<script setup lang="ts">
import { File, Upload as UploadIcon, X } from 'lucide-vue-next'
import { computed } from 'vue'

import { Button } from '@/components/ui/button'
import UploadCore from '@/components/ui/upload/Upload.vue'

type FileSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /** 当前文件 object_name (v-model) */
    modelValue?: string | null
    /** 文件名称（显示用） */
    fileName?: string
    /** 按钮尺寸 */
    size?: FileSize
    /** 按钮样式变体 */
    variant?: 'default' | 'outline' | 'ghost' | 'secondary'
    /** 接受的文件类型 */
    accept?: string
    /** 上传类型 */
    type?: 'image' | 'file'
    /** 是否禁用 */
    disabled?: boolean
    /** 最大文件大小 (MB) */
    maxSize?: number
    /** 是否显示已上传文件 */
    showUploaded?: boolean
    /** 是否显示清除按钮 */
    showClear?: boolean
  }>(),
  {
    modelValue: null,
    fileName: '',
    size: 'md',
    variant: 'outline',
    accept: '*',
    type: 'file',
    disabled: false,
    maxSize: 10,
    showUploaded: true,
    showClear: true
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'success', value: { objectName: string }): void
  (e: 'error', error: Error): void
  (e: 'clear'): void
}>()

const buttonSizes: Record<FileSize, 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg'
}

const buttonSize = computed(() => buttonSizes[props.size])
const hasFile = computed(() => props.modelValue)

function handleSuccess(data: { objectName: string }) {
  emit('success', data)
}

function handleError(error: Error) {
  emit('error', error)
}

function handleClear() {
  emit('update:modelValue', null)
  emit('clear')
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- 已上传文件显示 -->
    <div v-if="showUploaded && hasFile" class="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5">
      <File class="size-4 text-muted-foreground" />
      <span class="text-sm truncate max-w-[200px]">{{ fileName || modelValue }}</span>
      <Button v-if="showClear" variant="ghost" size="icon-sm" class="ml-1" :disabled="disabled" @click="handleClear">
        <X class="size-3" />
      </Button>
    </div>

    <!-- 上传按钮 -->
    <UploadCore
      :model-value="modelValue"
      :accept="accept"
      :type="type"
      :max-size="maxSize"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
      @success="handleSuccess"
      @error="handleError"
    >
      <template #default="{ uploading, triggerUpload, disabled }">
        <Button :variant="variant" :size="buttonSize" :disabled="disabled" @click="triggerUpload">
          <UploadIcon v-if="!uploading" class="size-4" />
          <span v-if="uploading">{{ $t('components.upload.uploading') }}</span>
          <span v-else>{{ $t('components.upload.selectFile') }}</span>
        </Button>
      </template>
    </UploadCore>
  </div>
</template>
