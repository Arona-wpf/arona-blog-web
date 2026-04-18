<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  disabled?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <Button
    data-slot="pagination-previous"
    variant="ghost"
    size="icon-sm"
    :class="cn('gap-1 pl-2.5', props.class)"
    :disabled="props.disabled"
    aria-label="Go to previous page"
  >
    <ChevronLeft class="size-4" />
    <slot />
  </Button>
</template>
