<script setup lang="ts">
import { SelectSeparator, type SelectSeparatorProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SelectSeparatorProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SelectSeparator data-slot="select-separator" :class="cn('-mx-1 my-1 h-px bg-muted', props.class)" v-bind="props" />
</template>
