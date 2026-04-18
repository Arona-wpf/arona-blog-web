<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  icon?: HTMLAttributes['class']
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '暂无数据',
  description: '这里暂时没有内容'
})
</script>

<template>
  <div data-slot="empty" :class="cn('flex flex-col items-center justify-center py-10 text-center', props.class)">
    <Inbox :class="cn('size-12 text-muted-foreground mb-4', props.icon)" />
    <h3 class="text-lg font-medium text-foreground mb-1">
      {{ title }}
    </h3>
    <p class="text-muted-foreground text-sm">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
