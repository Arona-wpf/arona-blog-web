<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'
import { computed, h, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'

const { t } = useI18n()
const { copy } = useClipboard()

interface GeneratedPassword {
  id: number
  value: string
}

const generatedPasswords = ref<GeneratedPassword[]>([])
const lengthInput = ref('16')
const countInput = ref('5')
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(false)
const enablePrefix = ref(false)
const prefixInput = ref('')
const separatorInput = ref('-')

const MIN_LENGTH = 8
const MAX_LENGTH = 128
const MIN_COUNT = 1
const MAX_COUNT = 100

const charset = computed(() => {
  let chars = ''
  if (includeUppercase.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (includeLowercase.value) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (includeNumbers.value) chars += '0123456789'
  if (includeSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  return chars
})

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

function generateSinglePassword(): string {
  if (charset.value.length === 0) return ''
  const len = getLength()
  let result = ''
  const array = new Uint32Array(len)
  crypto.getRandomValues(array)
  for (let i = 0; i < len; i++) {
    const randomIndex = array[i] ?? 0
    result += charset.value[randomIndex % charset.value.length]
  }
  return result
}

function generatePasswords() {
  const count = getCount()
  const newPasswords: GeneratedPassword[] = []
  for (let i = 0; i < count; i++) {
    let password = generateSinglePassword()
    if (enablePrefix.value && prefixInput.value && separatorInput.value) {
      password = `${prefixInput.value}${separatorInput.value}${password}`
    }
    newPasswords.push({
      id: i + 1,
      value: password
    })
  }
  generatedPasswords.value = newPasswords
}

// Auto generate when options change
watch(
  [
    lengthInput,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    countInput,
    enablePrefix,
    prefixInput,
    separatorInput
  ],
  () => {
    generatePasswords()
  }
)

// Initial generate
generatePasswords()

function copyPassword(password: string) {
  if (!password) return
  copy(password).then(() => {
    toast.success(t('views.dev.copySuccess'))
  })
}

function copyAllPasswords() {
  const allPasswords = generatedPasswords.value.map((p) => p.value).join('\n')
  copy(allPasswords).then(() => {
    toast.success(t('views.dev.password.allCopied'))
  })
}

const columns: ColumnDef<GeneratedPassword>[] = [
  {
    accessorKey: 'id',
    header: () => t('views.dev.password.table.index'),
    size: 80
  },
  {
    accessorKey: 'value',
    header: () => t('views.dev.password.table.value'),
    cell: ({ row }) => {
      return h('span', { class: 'font-mono' }, row.original.value)
    }
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'flex justify-center' }, t('views.dev.password.table.actions')),
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex justify-center' },
        h(
          Button,
          {
            variant: 'outline',
            size: 'sm',
            onClick: () => copyPassword(row.original.value)
          },
          () => t('views.dev.password.copy')
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
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.password.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.password.description') }}</p>
    </div>

    <div class="space-y-4">
      <!-- Length Input -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.password.length') }}</label>
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
        <label class="text-sm font-medium">{{ t('views.dev.password.count') }}</label>
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

      <!-- Character Options -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium">{{ t('views.dev.password.charset') }}</label>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <Checkbox id="uppercase" v-model:model-value="includeUppercase" />
            <label for="uppercase" class="text-sm cursor-pointer">
              {{ t('views.dev.password.uppercase') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="lowercase" v-model:model-value="includeLowercase" />
            <label for="lowercase" class="text-sm cursor-pointer">
              {{ t('views.dev.password.lowercase') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="numbers" v-model:model-value="includeNumbers" />
            <label for="numbers" class="text-sm cursor-pointer">
              {{ t('views.dev.password.numbers') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="symbols" v-model:model-value="includeSymbols" />
            <label for="symbols" class="text-sm cursor-pointer">
              {{ t('views.dev.password.symbols') }}
            </label>
          </div>
        </div>
      </div>

      <!-- Prefix Options -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <Checkbox id="enablePrefix" v-model:model-value="enablePrefix" />
          <label for="enablePrefix" class="text-sm cursor-pointer">
            {{ t('views.dev.password.enablePrefix') }}
          </label>
        </div>

        <div v-if="enablePrefix" class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm">{{ t('views.dev.password.prefix') }}</label>
            <Input
              v-model="prefixInput"
              type="text"
              class="w-[120px]"
              :placeholder="t('views.dev.password.prefixPlaceholder')"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm">{{ t('views.dev.password.separator') }}</label>
            <Input v-model="separatorInput" type="text" class="w-[60px]" maxlength="2" placeholder="-" />
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <Button @click="generatePasswords" class="w-full">
        {{ t('views.dev.password.generate') }}
      </Button>

      <!-- Results Table -->
      <div v-if="generatedPasswords.length > 0" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">{{ t('views.dev.password.results') }}</span>
          <Button variant="outline" size="sm" @click="copyAllPasswords">
            {{ t('views.dev.password.copyAll') }}
          </Button>
        </div>
        <DataTable
          :columns="columns"
          :data="generatedPasswords"
          :show-pagination="generatedPasswords.length > 10"
          :show-reload="false"
        />
      </div>
    </div>
  </div>
</template>
