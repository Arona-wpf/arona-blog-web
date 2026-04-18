<script setup lang="ts">
import { SelectViewport, type SelectViewportProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SelectViewportProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SelectViewport data-slot="select-viewport" :class="cn('p-1', props.class)" v-bind="props">
    <slot />
  </SelectViewport>
</template>
