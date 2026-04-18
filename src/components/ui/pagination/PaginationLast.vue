<script setup lang="ts">
import { ChevronsRight } from 'lucide-vue-next'
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
    data-slot="pagination-last"
    variant="ghost"
    size="icon-sm"
    :class="cn('gap-1 pr-2.5', props.class)"
    :disabled="props.disabled"
    aria-label="Go to last page"
  >
    <slot />
    <ChevronsRight class="size-4" />
  </Button>
</template>
