<script setup lang="ts">
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { computed, type HTMLAttributes } from 'vue'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('change', page)
    props.onPageChange?.(page)
  }
}

function goToFirstPage() {
  goToPage(1)
}

function goToLastPage() {
  goToPage(props.totalPages)
}

function goToPrevPage() {
  goToPage(props.currentPage - 1)
}

function goToNextPage() {
  goToPage(props.currentPage + 1)
}

// Generate visible page numbers
const visiblePages = computed(() => {
  const pages: (number | 'ellipsis')[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (current > 3) {
      pages.push('ellipsis')
    }

    // Show pages around current
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('ellipsis')
    }

    // Always show last page
    pages.push(total)
  }

  return pages
})
</script>

<template>
  <nav
    data-slot="pagination"
    :class="cn('flex items-center justify-center gap-1', props.class)"
    role="navigation"
    aria-label="pagination"
  >
    <Button
      variant="ghost"
      size="icon-sm"
      :disabled="currentPage <= 1"
      @click="goToFirstPage"
      aria-label="Go to first page"
    >
      <ChevronsLeft class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      :disabled="currentPage <= 1"
      @click="goToPrevPage"
      aria-label="Go to previous page"
    >
      <ChevronLeft class="size-4" />
    </Button>

    <div class="flex items-center gap-1">
      <template v-for="(page, index) in visiblePages" :key="index">
        <span v-if="page === 'ellipsis'" class="px-2 text-muted-foreground"> ... </span>
        <Button
          v-else
          :variant="page === currentPage ? 'default' : 'ghost'"
          size="icon-sm"
          @click="goToPage(page)"
          :aria-label="`Go to page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
        >
          {{ page }}
        </Button>
      </template>
    </div>

    <Button
      variant="ghost"
      size="icon-sm"
      :disabled="currentPage >= totalPages"
      @click="goToNextPage"
      aria-label="Go to next page"
    >
      <ChevronRight class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      :disabled="currentPage >= totalPages"
      @click="goToLastPage"
      aria-label="Go to last page"
    >
      <ChevronsRight class="size-4" />
    </Button>
  </nav>
</template>
