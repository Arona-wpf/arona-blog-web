<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const { t } = useI18n()
const { copy } = useClipboard()

// 罗马数字符号
const romanSymbols = [
  { value: 1000, symbol: 'M' },
  { value: 900, symbol: 'CM' },
  { value: 500, symbol: 'D' },
  { value: 400, symbol: 'CD' },
  { value: 100, symbol: 'C' },
  { value: 90, symbol: 'XC' },
  { value: 50, symbol: 'L' },
  { value: 40, symbol: 'XL' },
  { value: 10, symbol: 'X' },
  { value: 9, symbol: 'IX' },
  { value: 5, symbol: 'V' },
  { value: 4, symbol: 'IV' },
  { value: 1, symbol: 'I' }
]

// 阿拉伯数字转罗马数字
function toRoman(num: number): string {
  if (num < 1 || num > 3999) return ''
  let result = ''
  let remaining = num
  for (const { value, symbol } of romanSymbols) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  return result
}

// 病马数字转阿拉伯数字
function fromRoman(roman: string): number | null {
  if (!roman) return null
  const upperRoman = roman.toUpperCase()
  let result = 0
  let i = 0

  // 验证输入是否有效
  const validChars = ['M', 'D', 'C', 'L', 'X', 'V', 'I']
  if (!upperRoman.split('').every((char) => validChars.includes(char))) {
    return null
  }

  while (i < upperRoman.length) {
    // 检查两个字符的组合 (如 CM, CD, XC, XL, IX, IV)
    if (i + 1 < upperRoman.length) {
      const twoChar = upperRoman.substring(i, i + 2)
      const match = romanSymbols.find((s) => s.symbol === twoChar)
      if (match) {
        result += match.value
        i += 2
        continue
      }
    }
    // 单字符
    const oneChar = upperRoman[i]
    const match = romanSymbols.find((s) => s.symbol === oneChar)
    if (match) {
      result += match.value
      i++
    } else {
      return null
    }
  }
  return result
}

const mode = ref<'toRoman' | 'toArabic'>('toRoman')
const inputValue = ref('')
const errorMessage = ref('')

const outputValue = computed(() => {
  if (!inputValue.value) return ''
  if (mode.value === 'toRoman') {
    const num = parseInt(inputValue.value, 10)
    if (isNaN(num) || num < 1 || num > 3999) return ''
    return toRoman(num)
  }
  const result = fromRoman(inputValue.value)
  if (result === null) return ''
  return result.toString()
})

// 监听输入变化，验证有效性
watch([inputValue, mode], () => {
  if (!inputValue.value) {
    errorMessage.value = ''
    return
  }
  if (mode.value === 'toRoman') {
    const num = parseInt(inputValue.value, 10)
    if (isNaN(num) || num < 1 || num > 3999) {
      errorMessage.value = t('views.dev.roman.rangeError')
    } else {
      errorMessage.value = ''
    }
  } else {
    const result = fromRoman(inputValue.value)
    if (result === null) {
      errorMessage.value = t('views.dev.roman.invalidRoman')
    } else {
      errorMessage.value = ''
    }
  }
})

function switchMode() {
  mode.value = mode.value === 'toRoman' ? 'toArabic' : 'toRoman'
  // 如果有输出值，切换后将其作为输入
  if (outputValue.value) {
    inputValue.value = outputValue.value
  } else {
    inputValue.value = ''
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

// 常用罗马数字参考
const commonRomans = [
  { arabic: 1, roman: 'I' },
  { arabic: 5, roman: 'V' },
  { arabic: 10, roman: 'X' },
  { arabic: 50, roman: 'L' },
  { arabic: 100, roman: 'C' },
  { arabic: 500, roman: 'D' },
  { arabic: 1000, roman: 'M' },
  { arabic: 1999, roman: 'MCMXCIX' },
  { arabic: 2026, roman: 'MMXXVI' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.roman.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.roman.description') }}</p>
    </div>

    <div class="space-y-4">
      <!-- 模式切换 -->
      <div class="flex gap-2">
        <Button :variant="mode === 'toRoman' ? 'default' : 'outline'" size="sm" @click="mode = 'toRoman'">
          {{ t('views.dev.roman.toRoman') }}
        </Button>
        <Button :variant="mode === 'toArabic' ? 'default' : 'outline'" size="sm" @click="mode = 'toArabic'">
          {{ t('views.dev.roman.toArabic') }}
        </Button>
      </div>

      <!-- 输入区域 -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">
          {{ mode === 'toRoman' ? t('views.dev.roman.inputArabic') : t('views.dev.roman.inputRoman') }}
        </label>
        <Input
          v-model="inputValue"
          :type="mode === 'toRoman' ? 'number' : 'text'"
          :min="mode === 'toRoman' ? 1 : undefined"
          :max="mode === 'toRoman' ? 3999 : undefined"
          class="font-mono uppercase"
          :placeholder="
            mode === 'toRoman'
              ? t('views.dev.roman.inputArabicPlaceholder')
              : t('views.dev.roman.inputRomanPlaceholder')
          "
        />
        <p v-if="errorMessage" class="text-destructive text-xs">{{ errorMessage }}</p>
      </div>

      <!-- 输出区域 -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">
          {{ mode === 'toRoman' ? t('views.dev.roman.outputRoman') : t('views.dev.roman.outputArabic') }}
        </label>
        <div class="rounded-md border px-3 py-2 font-mono text-sm uppercase">
          {{ outputValue || '-' }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2">
        <Button variant="outline" @click="switchMode">
          {{ t('views.dev.roman.switch') }}
        </Button>
        <Button variant="outline" @click="copyResult" :disabled="!outputValue">
          {{ t('views.dev.roman.copy') }}
        </Button>
        <Button variant="destructive" @click="clearAll">
          {{ t('views.dev.roman.clear') }}
        </Button>
      </div>

      <!-- 常用参考 -->
      <div class="space-y-2">
        <label class="text-sm font-medium">{{ t('views.dev.roman.reference') }}</label>
        <div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <div
            v-for="item in commonRomans"
            :key="item.arabic"
            class="rounded-md border bg-transparent px-3 py-2 text-sm"
          >
            <span class="font-mono">{{ item.arabic }}</span>
            <span class="text-muted-foreground mx-1">=</span>
            <span class="font-mono uppercase">{{ item.roman }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
