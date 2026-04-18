<script setup lang="ts">
import { ComboboxLabel, type ComboboxLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends ComboboxLabelProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <ComboboxLabel data-slot="combobox-label" :class="cn('px-2 py-1.5 text-sm font-medium', props.class)" v-bind="props">
    <slot />
  </ComboboxLabel>
</template>
