<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import {
  ComboboxItem,
  type ComboboxItemEmits,
  ComboboxItemIndicator,
  type ComboboxItemProps,
  useForwardPropsEmits
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends ComboboxItemProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const emits = defineEmits<ComboboxItemEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ComboboxItem
    data-slot="combobox-item"
    :class="
      cn(
        'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class
      )
    "
    v-bind="forwarded"
  >
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      <ComboboxItemIndicator>
        <Check class="size-4" />
      </ComboboxItemIndicator>
    </span>
    <slot />
  </ComboboxItem>
</template>
