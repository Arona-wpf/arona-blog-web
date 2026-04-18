<script setup lang="ts">
import { ComboboxEmpty, type ComboboxEmptyProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends ComboboxEmptyProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <ComboboxEmpty data-slot="combobox-empty" :class="cn('py-6 text-center text-sm', props.class)" v-bind="props">
    <slot />
  </ComboboxEmpty>
</template>
