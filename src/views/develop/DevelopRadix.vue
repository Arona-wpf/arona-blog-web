<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const { t } = useI18n()
const { copy } = useClipboard()

// 支持的进制
const radixOptions = [
  { value: 2, label: '2 (二进制)' },
  { value: 8, label: '8 (八进制)' },
  { value: 10, label: '10 (十进制)' },
  { value: 16, label: '16 (十六进制)' },
  { value: 32, label: '32 (三十二进制)' },
  { value: 36, label: '36 (三十六进制)' }
]

const inputValue = ref('')
const inputRadix = ref(10)
const outputRadix = ref(16)
const errorMessage = ref('')

// 根据进制生成有效的字符集
function getValidChars(radix: number): string {
  if (radix <= 10) return '0123456789'.slice(0, radix)
  return '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, radix)
}

// 验证输入是否有效
function validateInput(value: string, radix: number): boolean {
  if (!value) return true
  const validChars = getValidChars(radix)
  const upperValue = value.toUpperCase()
  return upperValue.split('').every((char) => validChars.includes(char))
}

// 转换函数
function convert(value: string, fromRadix: number, toRadix: number): string {
  if (!value) return ''
  try {
    // 先转换为十进制
    const decimal = parseInt(value, fromRadix)
    if (isNaN(decimal)) return ''
    // 再从十进制转换为目标进制
    return decimal.toString(toRadix).toUpperCase()
  } catch {
    return ''
  }
}

const outputValue = computed(() => {
  if (!inputValue.value) return ''
  return convert(inputValue.value, inputRadix.value, outputRadix.value)
})

// 监听输入变化，验证有效性
watch([inputValue, inputRadix], () => {
  if (inputValue.value && !validateInput(inputValue.value, inputRadix.value)) {
    errorMessage.value = t('views.dev.radix.invalidInput')
  } else {
    errorMessage.value = ''
  }
})

function swapRadix() {
  const temp = inputRadix.value
  inputRadix.value = outputRadix.value
  outputRadix.value = temp
  // 交换后，输入值需要转换
  if (outputValue.value) {
    inputValue.value = outputValue.value
  }
}

function copyResult() {
  if (!outputValue.value) return
  copy(outputValue.value).then(() => {
    toast.success(t('views.dev.copySuccess'))
  })
}

function clearAll() {
  inputValue.value = ''
  errorMessage.value = ''
}

// 所有进制转换结果
const allRadixResults = computed(() => {
  if (!inputValue.value || errorMessage.value) return []
  const decimal = parseInt(inputValue.value, inputRadix.value)
  if (isNaN(decimal)) return []
  return radixOptions.map((r) => ({
    radix: r.value,
    label: r.label,
    value: decimal.toString(r.value).toUpperCase()
  }))
})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.radix.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.radix.description') }}</p>
    </div>

    <div class="space-y-4">
      <!-- 输入区域 -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.radix.input') }}</label>
        <div class="flex items-center gap-2">
          <Input
            v-model="inputValue"
            class="flex-1 font-mono uppercase"
            :placeholder="t('views.dev.radix.inputPlaceholder')"
          />
          <Select v-model:model-value="inputRadix">
            <SelectTrigger class="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="radix in radixOptions" :key="radix.value" :value="radix.value">
                {{ radix.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p v-if="errorMessage" class="text-destructive text-xs">{{ errorMessage }}</p>
      </div>

      <!-- 交换按钮 -->
      <Button variant="outline" size="sm" @click="swapRadix">
        {{ t('views.dev.radix.swap') }}
      </Button>

      <!-- 输出区域 -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.radix.output') }}</label>
        <div class="flex items-center gap-2">
          <div class="flex-1 rounded-md border px-3 py-2 font-mono text-sm uppercase">
            {{ outputValue || '-' }}
          </div>
          <Select v-model:model-value="outputRadix">
            <SelectTrigger class="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="radix in radixOptions" :key="radix.value" :value="radix.value">
                {{ radix.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <Button variant="outline" @click="copyResult" :disabled="!outputValue">
          {{ t('views.dev.radix.copy') }}
        </Button>
        <Button variant="destructive" @click="clearAll">
          {{ t('views.dev.radix.clear') }}
        </Button>
      </div>

      <!-- 所有进制转换结果 -->
      <div v-if="allRadixResults.length > 0" class="space-y-2">
        <label class="text-sm font-medium">{{ t('views.dev.radix.allRadix') }}</label>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="result in allRadixResults" :key="result.radix" class="rounded-md border bg-transparent px-3 py-2">
            <span class="text-muted-foreground text-sm">{{ result.label }}:</span>
            <span class="ml-2 font-mono text-sm uppercase">{{ result.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
