<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  message: string
}>()

const { t } = useI18n()
</script>

<template>
  <Dialog :open="props.open">
    <DialogContent class="[&>button]:hidden sm:max-w-[540px]">
      <DialogHeader>
        <DialogTitle>{{ t('global.gachaSync.title') }}</DialogTitle>
        <DialogDescription class="flex items-center gap-3 pt-2">
          <Loader2 class="text-primary size-10 animate-spin shrink-0" />
          <span>{{ props.message || t('global.gachaSync.defaultProgress') }}</span>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>
