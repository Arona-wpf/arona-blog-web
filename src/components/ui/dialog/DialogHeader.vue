<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div
    data-slot="dialog-header"
    :class="cn('flex flex-col gap-2 text-center sm:text-left px-6 pt-6 shrink-0', props.class)"
  >
    <slot />
  </div>
</template>
