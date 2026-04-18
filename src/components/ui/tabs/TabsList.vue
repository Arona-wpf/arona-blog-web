<script setup lang="ts">
import { TabsList, type TabsListProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends TabsListProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    :class="
      cn('bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-1', props.class)
    "
    v-bind="props"
  >
    <slot />
  </TabsList>
</template>
