<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { UploadFileProgress } from '@/components/ui/upload'
import { type GameType, GameTypeEnum } from '@/definitions/enums/gacha.enum'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_gacha_import } from '@/fetch/gacha'
import type { ImportGachaResData } from '@/fetch/gacha/types'

const props = defineProps<{
  open: boolean
  gameType: GameType
  gachaConfigId: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success', data: ImportGachaResData): void
}>()

const { t } = useI18n()

const uploadRef = ref<InstanceType<typeof UploadFileProgress> | null>(null)

const titleKey = computed(() => {
  switch (props.gameType) {
    case GameTypeEnum.GENSHIN_IMPACT:
      return 'views.gacha.importDialog.titleGenshin'
    case GameTypeEnum.HONKAI_STAR_RAIL:
      return 'views.gacha.importDialog.titleStarrail'
    case GameTypeEnum.ZENLESS_ZONE_ZERO:
      return 'views.gacha.importDialog.titleZZZ'
    default:
      return 'views.gacha.importDialog.title'
  }
})

const hasFile = computed(() => uploadRef.value?.selectedFile !== null)
const isUploading = computed(() => uploadRef.value?.uploading ?? false)

async function uploadHandler(file: File, onProgress: (progress: number) => void) {
  const res = await pr_v1_gacha_import(
    {
      file,
      game_type: props.gameType,
      gacha_config_id: props.gachaConfigId
    },
    onProgress
  )

  if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
    return {
      success: true,
      data: res.data
    }
  }

  return {
    success: false,
    error: res.msg || t('views.gacha.importDialog.importFailed')
  }
}

function handleUploadSuccess(data: ImportGachaResData) {
  toast.success(t('views.gacha.importDialog.importSuccessDetail', { total: data.total, imported: data.imported }))
  emit('success', data)
  emit('update:open', false)
}

function handleUploadError(error: string) {
  console.error('handleUploadError', error)
  toast.error(t('views.gacha.importDialog.importFailed'))
}

function handleClose() {
  if (!isUploading.value) {
    emit('update:open', false)
    uploadRef.value?.handleClearFile()
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleClose">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t(titleKey) }}</DialogTitle>
        <DialogDescription>{{ t('views.gacha.importDialog.description') }}</DialogDescription>
      </DialogHeader>

      <UploadFileProgress
        ref="uploadRef"
        accept=".json"
        :max-size="10"
        :upload-handler="uploadHandler"
        :drag-hint="t('views.gacha.importDialog.dragHint')"
        :file-type-hint="t('views.gacha.importDialog.fileTypeHint')"
        @success="handleUploadSuccess"
        @error="handleUploadError"
      />

      <DialogFooter>
        <Button variant="outline" :disabled="isUploading" @click="handleClose">
          {{ t('views.gacha.importDialog.cancel') }}
        </Button>
        <Button :loading="isUploading" :disabled="!hasFile || isUploading" @click="uploadRef?.handleUpload">
          {{ t('views.gacha.importDialog.upload') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
