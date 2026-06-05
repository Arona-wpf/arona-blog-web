<script setup lang="ts">
import { AlertCircle, Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  message: string
  status?: 'processing' | 'completed' | 'failed'
}>()

const { t } = useI18n()

const isFailed = computed(() => props.status === 'failed')
const isProcessing = computed(() => props.status === 'processing')
</script>

<template>
  <Dialog :open="props.open">
    <DialogContent :class="{ '[&>button]:hidden': isProcessing }" class="sm:max-w-[540px]">
      <DialogHeader>
        <DialogTitle>{{ t('global.gachaSync.title') }}</DialogTitle>
        <DialogDescription class="flex items-center gap-3 pt-2">
          <Loader2 v-if="isProcessing" class="text-primary size-10 animate-spin shrink-0" />
          <AlertCircle v-else-if="isFailed" class="text-destructive size-10 shrink-0" />
          <span>{{ props.message || t('global.gachaSync.defaultProgress') }}</span>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>
