<script setup lang="ts">
import { ComboboxSeparator, type ComboboxSeparatorProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends ComboboxSeparatorProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <ComboboxSeparator
    data-slot="combobox-separator"
    :class="cn('-mx-1 my-1 h-px bg-muted', props.class)"
    v-bind="props"
  />
</template>
