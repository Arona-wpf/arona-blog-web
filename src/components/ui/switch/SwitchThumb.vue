<script setup lang="ts">
import { SwitchThumb, type SwitchThumbProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends SwitchThumbProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <SwitchThumb
    data-slot="switch-thumb"
    :class="
      cn(
        'bg-background dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring shadow-sm transition-[translate,shadow] data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:shadow-xs',
        props.class
      )
    "
    v-bind="props"
  />
</template>
