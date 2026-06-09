<script setup lang="ts">
import { type HTMLAttributes, nextTick, ref, watch } from 'vue'

import { cn } from '@/lib/utils'

import { useSidebar } from './utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const contentRef = ref<HTMLElement | null>(null)
const { openMobile, isMobile } = useSidebar()

const SHEET_OPEN_ANIMATION_MS = 300

watch(openMobile, async (open, _, onCleanup) => {
  if (!open || !isMobile.value) return
  await nextTick()
  const timer = window.setTimeout(() => {
    const container = contentRef.value
    if (!container) return
    const active = container.querySelector('[data-sidebar="menu-button"][data-active="true"]')
    active?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, SHEET_OPEN_ANIMATION_MS)
  onCleanup(() => clearTimeout(timer))
})
</script>

<template>
  <div
    ref="contentRef"
    data-slot="sidebar-content"
    data-sidebar="content"
    :class="
      cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden', props.class)
    "
  >
    <slot />
  </div>
</template>
