<script setup lang="ts">
import { TabsContent, type TabsContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props extends TabsContentProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <TabsContent data-slot="tabs-content" :class="cn('flex-1 outline-none', props.class)" v-bind="props">
    <slot />
  </TabsContent>
</template>
