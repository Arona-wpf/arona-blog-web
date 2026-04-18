<script setup lang="ts">
import { ChevronUp } from 'lucide-vue-next'
import { SelectScrollUpButton, type SelectScrollUpButtonProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SelectScrollUpButtonProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SelectScrollUpButton
    data-slot="select-scroll-up-button"
    :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
    v-bind="props"
  >
    <ChevronUp class="size-4" />
  </SelectScrollUpButton>
</template>
