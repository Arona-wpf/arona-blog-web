<script setup lang="ts">
import { Upload } from 'lucide-vue-next'
import { computed } from 'vue'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import UploadCore from '@/components/ui/upload/Upload.vue'
import { SITE_MINIO_API_URL } from '@/definitions/constants/site.constants'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const props = withDefaults(
  defineProps<{
    /** 当前头像 object_name (v-model) */
    modelValue?: string | null
    /** 默认头像 URL */
    defaultSrc?: string
    /** 头像尺寸 */
    size?: AvatarSize
    /** 是否禁用 */
    disabled?: boolean
    /** 接受的文件类型 */
    accept?: string
    /** 最大文件大小 (MB) */
    maxSize?: number
  }>(),
  {
    modelValue: null,
    defaultSrc: '',
    size: 'xl',
    disabled: false,
    accept: 'image/*',
    maxSize: 5
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'success', value: { objectName: string }): void
  (e: 'error', error: Error): void
}>()

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-20',
  '2xl': 'size-24'
}

const iconSizes: Record<AvatarSize, string> = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
  '2xl': 'size-7'
}

/** 显示的 src：如果有 object_name 则通过 CDN 获取，否则使用默认头像 */
const displaySrc = computed(() => {
  if (props.modelValue) {
    return `${SITE_MINIO_API_URL}/${props.modelValue}`
  }
  return props.defaultSrc
})

const avatarClass = computed(() => sizeClasses[props.size])
const iconClass = computed(() => iconSizes[props.size])

function handleSuccess(data: { objectName: string }) {
  emit('success', data)
}

function handleError(error: Error) {
  emit('error', error)
}
</script>

<template>
  <UploadCore
    :model-value="modelValue"
    :accept="accept"
    type="image"
    :max-size="maxSize"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event)"
    @success="handleSuccess"
    @error="handleError"
  >
    <template #default="{ uploading, triggerUpload, disabled }">
      <div
        class="relative cursor-pointer rounded-full transition-opacity group"
        :class="[{ 'opacity-50': uploading || disabled }, avatarClass]"
        @click="triggerUpload"
      >
        <Avatar :class="avatarClass">
          <AvatarImage :src="displaySrc" />
        </Avatar>
        <!-- 悬浮遮罩 -->
        <div
          class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          :class="{ '!opacity-100': uploading }"
        >
          <Upload v-if="!uploading" :class="iconClass" class="text-white" />
          <span v-else class="text-xs text-white">{{ $t('components.upload.uploading') }}</span>
        </div>
      </div>
    </template>
  </UploadCore>
</template>
