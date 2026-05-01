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
const mode = ref<'toUnicode' | 'toChinese'>('toUnicode')

// 中文转 Unicode
function chineseToUnicode(text: string): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code > 127) {
        // 非ASCII字符（中文等）转为 \uXXXX 格式
        return `\\u${code.toString(16).padStart(4, '0')}`
      }
      return char
    })
    .join('')
}

// Unicode 转中文
function unicodeToChinese(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
}

function processUnicode() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    if (mode.value === 'toUnicode') {
      outputText.value = chineseToUnicode(inputText.value)
    } else {
      outputText.value = unicodeToChinese(inputText.value)
    }
  } catch {
    toast.error(t('views.text.unicode.error'))
    outputText.value = ''
  }
}

// 使用 watch 监听输入变化，解决输入法组合输入问题
watch([inputText, mode], () => {
  processUnicode()
})

function setToUnicodeMode() {
  mode.value = 'toUnicode'
  processUnicode()
}

function setToChineseMode() {
  mode.value = 'toChinese'
  processUnicode()
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
  mode.value = mode.value === 'toUnicode' ? 'toChinese' : 'toUnicode'
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.text.unicode.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.text.unicode.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Mode Selection -->
      <div class="flex gap-2">
        <Button :variant="mode === 'toUnicode' ? 'default' : 'outline'" size="sm" @click="setToUnicodeMode">
          {{ t('views.text.unicode.toUnicode') }}
        </Button>
        <Button :variant="mode === 'toChinese' ? 'default' : 'outline'" size="sm" @click="setToChineseMode">
          {{ t('views.text.unicode.toChinese') }}
        </Button>
      </div>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{
          mode === 'toUnicode' ? t('views.text.unicode.inputChinese') : t('views.text.unicode.inputUnicode')
        }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'toUnicode'
              ? t('views.text.unicode.inputChinesePlaceholder')
              : t('views.text.unicode.inputUnicodePlaceholder')
          "
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{
          mode === 'toUnicode' ? t('views.text.unicode.outputUnicode') : t('views.text.unicode.outputChinese')
        }}</Label>
        <Textarea v-model="outputText" readonly rows="4" class="font-mono bg-muted" />
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="copyOutput" :disabled="!outputText">
            {{ t('views.text.copy') }}
          </Button>
          <Button variant="outline" size="sm" @click="swapContent" :disabled="!outputText">
            {{ t('views.text.unicode.swap') }}
          </Button>
          <Button variant="outline" size="sm" @click="clearAll">
            {{ t('views.text.clear') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
