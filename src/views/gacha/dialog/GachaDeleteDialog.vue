<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_gacha_config_delete } from '@/fetch/gacha'

const props = defineProps<{
  open: boolean
  accountId: string
  accountName: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const deleting = ref(false)

async function handleDeleteConfirm() {
  if (!props.accountId || deleting.value) return

  deleting.value = true
  try {
    const res = await pr_v1_gacha_config_delete({ _id: props.accountId })
    if (res.code === ResponseCodeEnum.SUCCESS) {
      emit('update:open', false)
      emit('success')
    }
  } finally {
    deleting.value = false
  }
}

function handleClose() {
  if (!deleting.value) {
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleClose">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('views.gacha.genshin.deleteTitle') }}</DialogTitle>
        <DialogDescription>
          {{ t('views.gacha.genshin.deleteDesc', { name: props.accountName }) }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" :disabled="deleting" @click="handleClose">
          {{ t('views.gacha.genshin.deleteCancel') }}
        </Button>
        <Button variant="destructive" :loading="deleting" @click="handleDeleteConfirm">
          <Trash2 class="size-4" />
          {{ t('views.gacha.genshin.deleteConfirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
