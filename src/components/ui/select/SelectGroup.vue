<script setup lang="ts">
import { SelectGroup, type SelectGroupProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SelectGroupProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SelectGroup data-slot="select-group" :class="cn('p-1', props.class)" v-bind="props">
    <slot />
  </SelectGroup>
</template>
