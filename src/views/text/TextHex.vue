<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormLabel as Label } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

const { t } = useI18n()
const { copy } = useClipboard()

const inputText = ref('')
const outputText = ref('')
const mode = ref<'toHex' | 'toText'>('toHex')
const separator = ref<'space' | 'none'>('space')

// 字符串转十六进制
function textToHex(text: string): string {
  const hexArray = text.split('').map((char) => {
    const code = char.charCodeAt(0)
    return code.toString(16).padStart(2, '0')
  })
  return separator.value === 'space' ? hexArray.join(' ') : hexArray.join('')
}

// 十六进制转字符串
function hexToText(hex: string): string {
  // 移除所有空格和常见分隔符
  const cleanHex = hex.replace(/[\s,;\-\n\r]/g, '')
  // 确保是偶数长度
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex length')
  }
  // 每两个字符一组转换为字符
  const chars: string[] = []
  for (let i = 0; i < cleanHex.length; i += 2) {
    const hexByte = cleanHex.slice(i, i + 2)
    const charCode = parseInt(hexByte, 16)
    chars.push(String.fromCharCode(charCode))
  }
  return chars.join('')
}

function processHex() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    if (mode.value === 'toHex') {
      outputText.value = textToHex(inputText.value)
    } else {
      outputText.value = hexToText(inputText.value)
    }
  } catch {
    toast.error(t('views.text.hex.error'))
    outputText.value = ''
  }
}

// 使用 watch 监听输入变化，解决输入法组合输入问题
watch([inputText, mode, separator], () => {
  processHex()
})

function setToHexMode() {
  mode.value = 'toHex'
  processHex()
}

function setToTextMode() {
  mode.value = 'toText'
  processHex()
}

function copyOutput() {
  if (!outputText.value) return
  copy(outputText.value).then(() => {
    toast.success(t('views.text.copySuccess'))
  })
}

function clearAll() {
  inputText.value = ''
  outputText.value = ''
}

function swapContent() {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  mode.value = mode.value === 'toHex' ? 'toText' : 'toHex'
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.text.hex.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.text.hex.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Mode Selection -->
      <div class="flex gap-2">
        <Button :variant="mode === 'toHex' ? 'default' : 'outline'" size="sm" @click="setToHexMode">
          {{ t('views.text.hex.toHex') }}
        </Button>
        <Button :variant="mode === 'toText' ? 'default' : 'outline'" size="sm" @click="setToTextMode">
          {{ t('views.text.hex.toText') }}
        </Button>
      </div>

      <!-- Separator Option (only for hex output) -->
      <div v-if="mode === 'toHex'" class="flex items-center gap-4">
        <Label class="text-sm">{{ t('views.text.hex.separator') }}</Label>
        <select v-model="separator" class="border rounded px-2 py-1 text-sm">
          <option value="space">{{ t('views.text.hex.separatorSpace') }}</option>
          <option value="none">{{ t('views.text.hex.separatorNone') }}</option>
        </select>
      </div>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'toHex' ? t('views.text.hex.inputText') : t('views.text.hex.inputHex') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'toHex' ? t('views.text.hex.inputTextPlaceholder') : t('views.text.hex.inputHexPlaceholder')
          "
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'toHex' ? t('views.text.hex.outputHex') : t('views.text.hex.outputText') }}</Label>
        <Textarea v-model="outputText" readonly rows="4" class="font-mono bg-muted" />
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="copyOutput" :disabled="!outputText">
            {{ t('views.text.copy') }}
          </Button>
          <Button variant="outline" size="sm" @click="swapContent" :disabled="!outputText">
            {{ t('views.text.hex.swap') }}
          </Button>
          <Button variant="outline" size="sm" @click="clearAll">
            {{ t('views.text.clear') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
