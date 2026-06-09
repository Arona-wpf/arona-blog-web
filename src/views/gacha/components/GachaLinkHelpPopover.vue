<script setup lang="ts">
import { CircleHelp } from 'lucide-vue-next'
import { onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const emit = defineEmits<{
  downloadScript: []
}>()

const { t } = useI18n()

const open = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

function showPopover() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  open.value = true
}

function hidePopover() {
  closeTimer = setTimeout(() => {
    open.value = false
  }, 100)
}

function handleDownloadScript() {
  emit('downloadScript')
}

onUnmounted(() => {
  if (closeTimer) {
    clearTimeout(closeTimer)
  }
})
</script>

<template>
  <Popover v-model:open="open" :modal="false">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="text-muted-foreground hover:text-foreground inline-flex size-4 shrink-0 items-center justify-center"
        :aria-label="t('views.gacha.common.gachaLinkHelpAriaLabel')"
        @click.prevent
        @mouseenter="showPopover"
        @mouseleave="hidePopover"
      >
        <CircleHelp class="size-3.5" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      class="w-auto max-w-xs p-3 text-sm"
      side="top"
      @mouseenter="showPopover"
      @mouseleave="hidePopover"
      @open-auto-focus.prevent
    >
      <span>
        {{ t('views.gacha.common.gachaLinkHelpPrefix') }}
        <Button variant="link" class="h-auto p-0 text-sm" @click="handleDownloadScript">
          {{ t('views.gacha.common.gachaLinkHelpDownload') }}
        </Button>
      </span>
    </PopoverContent>
  </Popover>
</template>
