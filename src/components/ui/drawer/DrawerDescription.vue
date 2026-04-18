<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends DialogDescriptionProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <DialogDescription
    data-slot="drawer-description"
    :class="cn('text-muted-foreground text-sm', props.class)"
    v-bind="props"
  >
    <slot />
  </DialogDescription>
</template>
