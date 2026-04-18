<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { SelectScrollDownButton, type SelectScrollDownButtonProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SelectScrollDownButtonProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SelectScrollDownButton
    data-slot="select-scroll-down-button"
    :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
    v-bind="props"
  >
    <ChevronDown class="size-4" />
  </SelectScrollDownButton>
</template>
