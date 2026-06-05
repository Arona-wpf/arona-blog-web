<script setup lang="ts">
import { ref, watch } from 'vue'
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
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_gacha_export } from '@/fetch/gacha'
import { silentDownload } from '@/lib/utils'

const props = defineProps<{
  open: boolean
  configId: string
  defaultFileName?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
  (e: 'exporting', value: boolean): void
}>()

const { t } = useI18n()

const exporting = ref(false)
const fileName = ref('')
const fileType = ref<'json' | 'excel'>('excel')

watch(
  () => props.open,
  (newVal) => {
    if (newVal && props.defaultFileName) {
      fileName.value = props.defaultFileName.replace(/[^a-zA-Z0-9一-龥_-]/g, '')
    }
  }
)

function handleOpenChange(open: boolean) {
  if (!exporting.value) {
    emit('update:open', open)
  }
}

async function handleConfirmExport() {
  if (!props.configId || !fileName.value) return

  exporting.value = true
  emit('exporting', true)
  try {
    const res = await pr_v1_gacha_export({
      gacha_config_id: props.configId,
      file_name: fileName.value,
      file_type: fileType.value
    })

    if (res.code === ResponseCodeEnum.SUCCESS && res.data?.url) {
      silentDownload(res.data.url)
      emit('success')
    }
  } catch {
    toast.error(t('views.gacha.genshin.exportFailed'))
  } finally {
    exporting.value = false
    emit('exporting', false)
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog :open="props.open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('views.gacha.genshin.exportDialogTitle') }}</DialogTitle>
        <DialogDescription>{{ t('views.gacha.genshin.exportDialogDesc') }}</DialogDescription>
      </DialogHeader>

      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <FormLabel>{{ t('views.gacha.genshin.exportFileName') }}</FormLabel>
          <Input v-model="fileName" :placeholder="t('views.gacha.genshin.exportFileNamePlaceholder')" />
        </div>

        <div class="space-y-2">
          <FormLabel>{{ t('views.gacha.genshin.exportFileType') }}</FormLabel>
          <RadioGroup v-model="fileType" class="flex gap-4">
            <div class="flex items-center gap-2">
              <RadioGroupItem value="excel" />
              <span>Excel (.xlsx)</span>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem value="json" />
              <span>JSON (.json)</span>
            </div>
          </RadioGroup>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleOpenChange(false)">
          {{ t('views.gacha.genshin.exportCancel') }}
        </Button>
        <Button :loading="exporting" :disabled="!fileName" @click="handleConfirmExport">
          {{ t('views.gacha.genshin.exportConfirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
