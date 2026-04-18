<script setup lang="ts">
import { ComboboxViewport, type ComboboxViewportProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends ComboboxViewportProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <ComboboxViewport data-slot="combobox-viewport" :class="cn('p-1', props.class)" v-bind="props">
    <slot />
  </ComboboxViewport>
</template>
