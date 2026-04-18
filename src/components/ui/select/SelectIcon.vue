<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { SelectIcon, type SelectIconProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SelectIconProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SelectIcon data-slot="select-icon" :class="cn('size-4 opacity-50', props.class)" v-bind="props">
    <ChevronDown />
  </SelectIcon>
</template>
