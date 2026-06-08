<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { Spinner } from '@/components/ui/spinner'

defineProps<{
  messageKey: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-10 text-center">
    <Spinner class="text-primary mb-4 size-10" />
    <p class="text-muted-foreground text-sm">{{ t(messageKey) }}</p>
  </div>
</template>
