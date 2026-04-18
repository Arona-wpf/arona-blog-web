<script setup lang="ts">
import { SelectLabel, type SelectLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SelectLabelProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SelectLabel data-slot="select-label" :class="cn('px-2 py-1.5 text-sm font-medium', props.class)" v-bind="props">
    <slot />
  </SelectLabel>
</template>
