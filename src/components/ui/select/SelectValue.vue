<script setup lang="ts">
import { SelectValue, type SelectValueProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SelectValueProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SelectValue data-slot="select-value" :class="cn('', props.class)" v-bind="props">
    <slot />
  </SelectValue>
</template>
