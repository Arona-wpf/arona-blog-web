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
const mode = ref<'encode' | 'decode'>('encode')

function processUrl() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    if (mode.value === 'encode') {
      outputText.value = encodeURIComponent(inputText.value)
    } else {
      outputText.value = decodeURIComponent(inputText.value)
    }
  } catch {
    toast.error(t('views.text.url.error'))
    outputText.value = ''
  }
}

// 使用 watch 监听输入变化，解决输入法组合输入问题
watch([inputText, mode], () => {
  processUrl()
})

function setEncodeMode() {
  mode.value = 'encode'
  processUrl()
}

function setDecodeMode() {
  mode.value = 'decode'
  processUrl()
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
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.text.url.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.text.url.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Mode Selection -->
      <div class="flex gap-2">
        <Button :variant="mode === 'encode' ? 'default' : 'outline'" size="sm" @click="setEncodeMode">
          {{ t('views.text.url.encode') }}
        </Button>
        <Button :variant="mode === 'decode' ? 'default' : 'outline'" size="sm" @click="setDecodeMode">
          {{ t('views.text.url.decode') }}
        </Button>
      </div>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encode' ? t('views.text.url.inputText') : t('views.text.url.inputUrl') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'encode' ? t('views.text.url.inputTextPlaceholder') : t('views.text.url.inputUrlPlaceholder')
          "
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encode' ? t('views.text.url.outputUrl') : t('views.text.url.outputText') }}</Label>
        <Textarea v-model="outputText" readonly rows="4" class="font-mono bg-muted" />
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="copyOutput" :disabled="!outputText">
            {{ t('views.text.copy') }}
          </Button>
          <Button variant="outline" size="sm" @click="swapContent" :disabled="!outputText">
            {{ t('views.text.url.swap') }}
          </Button>
          <Button variant="outline" size="sm" @click="clearAll">
            {{ t('views.text.clear') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
