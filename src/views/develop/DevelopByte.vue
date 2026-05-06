<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const { t } = useI18n()
const { copy } = useClipboard()

// 数据存储单位 (以字节为基准)
const units = [
  { key: 'bit', name: 'bit', bytes: 1 / 8 },
  { key: 'byte', name: 'B', bytes: 1 },
  { key: 'kilobyte', name: 'KB', bytes: 1024 },
  { key: 'megabyte', name: 'MB', bytes: 1024 * 1024 },
  { key: 'gigabyte', name: 'GB', bytes: 1024 * 1024 * 1024 },
  { key: 'terabyte', name: 'TB', bytes: 1024 * 1024 * 1024 * 1024 },
  { key: 'petabyte', name: 'PB', bytes: 1024 * 1024 * 1024 * 1024 * 1024 }
]

const inputValue = ref('')
const inputUnit = ref('byte')
const outputUnit = ref('kilobyte')

const outputUnitLabel = computed(() => units.find((u) => u.key === outputUnit.value)?.name || 'KB')

const outputValue = computed(() => {
  if (!inputValue.value) return ''
  const num = parseFloat(inputValue.value)
  if (isNaN(num) || num < 0) return ''

  const inputBytes = units.find((u) => u.key === inputUnit.value)?.bytes || 1
  const outputBytes = units.find((u) => u.key === outputUnit.value)?.bytes || 1

  const bytes = num * inputBytes
  const result = bytes / outputBytes

  // 根据结果大小决定精度
  if (result >= 1000000) return result.toFixed(2)
  if (result >= 1000) return result.toFixed(4)
  if (result < 0.000001) return result.toFixed(8)
  return result.toFixed(6)
})

function swapUnits() {
  const temp = inputUnit.value
  inputUnit.value = outputUnit.value
  outputUnit.value = temp
}

function copyResult() {
  if (!outputValue.value) return
  copy(`${outputValue.value} ${outputUnitLabel.value}`).then(() => {
    toast.success(t('views.dev.copySuccess'))
  })
}

function clearAll() {
  inputValue.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.byte.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.byte.description') }}</p>
    </div>

    <div class="space-y-4">
      <!-- 输入区域 -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.byte.input') }}</label>
        <div class="flex items-center gap-2">
          <Input
            v-model="inputValue"
            type="number"
            min="0"
            step="any"
            class="flex-1"
            :placeholder="t('views.dev.byte.inputPlaceholder')"
          />
          <Select v-model="inputUnit">
            <SelectTrigger class="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="unit in units" :key="unit.key" :value="unit.key">
                {{ unit.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- 交换按钮 -->
      <Button variant="outline" size="sm" @click="swapUnits">
        {{ t('views.dev.byte.swap') }}
      </Button>

      <!-- 输出区域 -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.byte.output') }}</label>
        <div class="flex items-center gap-2">
          <div class="flex-1 rounded-md border px-3 py-2 font-mono text-sm">
            {{ outputValue || '-' }}
          </div>
          <Select v-model="outputUnit">
            <SelectTrigger class="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="unit in units" :key="unit.key" :value="unit.key">
                {{ unit.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <Button variant="outline" @click="copyResult" :disabled="!outputValue">
          {{ t('views.dev.byte.copy') }}
        </Button>
        <Button variant="destructive" @click="clearAll">
          {{ t('views.dev.byte.clear') }}
        </Button>
      </div>

      <!-- 所有单位转换结果 -->
      <div v-if="outputValue" class="space-y-2">
        <label class="text-sm font-medium">{{ t('views.dev.byte.allUnits') }}</label>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="unit in units" :key="unit.key" class="rounded-md border bg-transparent px-3 py-2 text-sm">
            <span class="text-muted-foreground">{{ unit.name }}:</span>
            <span class="ml-2 font-mono">
              {{
                ((parseFloat(inputValue) * (units.find((u) => u.key === inputUnit)?.bytes || 1)) / unit.bytes).toFixed(
                  6
                )
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
