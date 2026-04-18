<script setup lang="ts">
import { ComboboxGroup, type ComboboxGroupProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends ComboboxGroupProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <ComboboxGroup data-slot="combobox-group" :class="cn('p-1', props.class)" v-bind="props">
    <slot />
  </ComboboxGroup>
</template>
