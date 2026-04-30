<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'
import { h, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'

const { t } = useI18n()
const { copy } = useClipboard()

interface GeneratedNanoid {
  id: number
  value: string
}

const generatedNanoids = ref<GeneratedNanoid[]>([])
const lengthInput = ref('16')
const countInput = ref('5')

const MIN_LENGTH = 8
const MAX_LENGTH = 128
const MIN_COUNT = 1
const MAX_COUNT = 100

// URL-safe characters for NanoID
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'

function clampLength(value: number): number {
  return Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, value))
}

function clampCount(value: number): number {
  return Math.max(MIN_COUNT, Math.min(MAX_COUNT, value))
}

function getLength(): number {
  const parsed = parseInt(lengthInput.value, 10)
  if (isNaN(parsed) || parsed < MIN_LENGTH) return MIN_LENGTH
  if (parsed > MAX_LENGTH) return MAX_LENGTH
  return parsed
}

function getCount(): number {
  const parsed = parseInt(countInput.value, 10)
  if (isNaN(parsed) || parsed < MIN_COUNT) return MIN_COUNT
  if (parsed > MAX_COUNT) return MAX_COUNT
  return parsed
}

function generateSingleNanoid(): string {
  const len = getLength()
  let result = ''
  const array = new Uint32Array(len)
  crypto.getRandomValues(array)
  for (let i = 0; i < len; i++) {
    const randomIndex = array[i] ?? 0
    result += charset[randomIndex % charset.length]
  }
  return result
}

function generateNanoids() {
  const count = getCount()
  const newNanoids: GeneratedNanoid[] = []
  for (let i = 0; i < count; i++) {
    newNanoids.push({
      id: i + 1,
      value: generateSingleNanoid()
    })
  }
  generatedNanoids.value = newNanoids
}

// Auto generate when options change
watch([lengthInput, countInput], () => {
  generateNanoids()
})

// Initial generate
generateNanoids()

function copyNanoid(value: string) {
  if (!value) return
  copy(value).then(() => {
    toast.success(t('views.dev.copySuccess'))
  })
}

function copyAllNanoids() {
  const allNanoids = generatedNanoids.value.map((n) => n.value).join('\n')
  copy(allNanoids).then(() => {
    toast.success(t('views.dev.nanoid.allCopied'))
  })
}

const columns: ColumnDef<GeneratedNanoid>[] = [
  {
    accessorKey: 'id',
    header: () => t('views.dev.nanoid.table.index'),
    size: 80
  },
  {
    accessorKey: 'value',
    header: () => t('views.dev.nanoid.table.value'),
    cell: ({ row }) => {
      return h('span', { class: 'font-mono' }, row.original.value)
    }
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'flex justify-center' }, t('views.dev.nanoid.table.actions')),
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex justify-center' },
        h(
          Button,
          {
            variant: 'outline',
            size: 'sm',
            onClick: () => copyNanoid(row.original.value)
          },
          () => t('views.dev.nanoid.copy')
        )
      )
    },
    size: 100
  }
]
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.nanoid.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.nanoid.description') }}</p>
    </div>

    <div class="space-y-4">
      <!-- Length Input -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.nanoid.length') }}</label>
        <div class="flex items-center gap-2">
          <Input
            v-model="lengthInput"
            type="number"
            :min="MIN_LENGTH"
            :max="MAX_LENGTH"
            class="w-[180px]"
            @blur="lengthInput = String(clampLength(getLength()))"
          />
          <span class="text-muted-foreground text-xs">({{ MIN_LENGTH }}-{{ MAX_LENGTH }})</span>
        </div>
      </div>

      <!-- Count Input -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.nanoid.count') }}</label>
        <div class="flex items-center gap-2">
          <Input
            v-model="countInput"
            type="number"
            :min="MIN_COUNT"
            :max="MAX_COUNT"
            class="w-[180px]"
            @blur="countInput = String(clampCount(getCount()))"
          />
          <span class="text-muted-foreground text-xs">({{ MIN_COUNT }}-{{ MAX_COUNT }})</span>
        </div>
      </div>

      <!-- Generate Button -->
      <Button @click="generateNanoids" class="w-full">
        {{ t('views.dev.nanoid.generate') }}
      </Button>

      <!-- Results Table -->
      <div v-if="generatedNanoids.length > 0" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">{{ t('views.dev.nanoid.results') }}</span>
          <Button variant="outline" size="sm" @click="copyAllNanoids">
            {{ t('views.dev.nanoid.copyAll') }}
          </Button>
        </div>
        <DataTable
          :columns="columns"
          :data="generatedNanoids"
          :show-pagination="generatedNanoids.length > 10"
          :show-reload="false"
        />
      </div>
    </div>
  </div>
</template>
