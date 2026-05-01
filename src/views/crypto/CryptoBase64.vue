<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { ref } from 'vue'
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

function processBase64() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    if (mode.value === 'encode') {
      // Encode to Base64
      outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
    } else {
      // Decode from Base64
      outputText.value = decodeURIComponent(escape(atob(inputText.value)))
    }
  } catch {
    toast.error(t('views.crypto.base64.error'))
    outputText.value = ''
  }
}

function copyOutput() {
  if (!outputText.value) return
  copy(outputText.value).then(() => {
    toast.success(t('views.crypto.copySuccess'))
  })
}

function clearAll() {
  inputText.value = ''
  outputText.value = ''
}

function setEncodeMode() {
  mode.value = 'encode'
  processBase64()
}

function setDecodeMode() {
  mode.value = 'decode'
  processBase64()
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
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.base64.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.base64.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Mode Selection -->
      <div class="flex gap-2">
        <Button :variant="mode === 'encode' ? 'default' : 'outline'" size="sm" @click="setEncodeMode">
          {{ t('views.crypto.base64.encode') }}
        </Button>
        <Button :variant="mode === 'decode' ? 'default' : 'outline'" size="sm" @click="setDecodeMode">
          {{ t('views.crypto.base64.decode') }}
        </Button>
      </div>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{
          mode === 'encode' ? t('views.crypto.base64.inputText') : t('views.crypto.base64.inputBase64')
        }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'encode'
              ? t('views.crypto.base64.inputTextPlaceholder')
              : t('views.crypto.base64.inputBase64Placeholder')
          "
          rows="4"
          class="font-mono"
          @input="processBase64"
        />
      </div>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{
          mode === 'encode' ? t('views.crypto.base64.outputBase64') : t('views.crypto.base64.outputText')
        }}</Label>
        <Textarea v-model="outputText" readonly rows="4" class="font-mono bg-muted" />
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="copyOutput" :disabled="!outputText">
            {{ t('views.crypto.copy') }}
          </Button>
          <Button variant="outline" size="sm" @click="swapContent" :disabled="!outputText">
            {{ t('views.crypto.base64.swap') }}
          </Button>
          <Button variant="outline" size="sm" @click="clearAll">
            {{ t('views.crypto.clear') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
