<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import {
  ComboboxAnchor,
  ComboboxInput,
  type ComboboxInputEmits,
  type ComboboxInputProps,
  ComboboxTrigger,
  useForwardPropsEmits
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends ComboboxInputProps {
  class?: HTMLAttributes['class']
}

defineOptions({
  inheritAttrs: false
})

const props = defineProps<Props>()
const emits = defineEmits<ComboboxInputEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ComboboxAnchor :class="cn('relative', props.class)">
    <ComboboxInput
      data-slot="combobox-input"
      :class="
        cn(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          props.class
        )
      "
      v-bind="{ ...$attrs, ...forwarded }"
    />
    <ComboboxTrigger class="absolute right-2 top-1/2 -translate-y-1/2">
      <ChevronDown class="size-4 opacity-50" />
    </ComboboxTrigger>
  </ComboboxAnchor>
</template>
