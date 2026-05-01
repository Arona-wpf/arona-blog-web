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
const outputEncoding = ref('hex')

async function generateHash() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    // Use SubtleCrypto for SHA-256 (MD5 not supported by Web Crypto API)
    const encoder = new TextEncoder()
    const data = encoder.encode(inputText.value)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    if (outputEncoding.value === 'hex') {
      outputText.value = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    } else {
      outputText.value = btoa(String.fromCharCode(...hashArray))
    }
  } catch {
    toast.error(t('views.crypto.md5.error'))
  }
}

// Auto-generate on input change
watch([inputText, outputEncoding], () => {
  generateHash()
})

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
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.md5.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.md5.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.md5.input') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="t('views.crypto.md5.inputPlaceholder')"
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Encoding Options -->
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <Label class="text-sm">{{ t('views.crypto.md5.outputEncoding') }}</Label>
          <select v-model="outputEncoding" class="border rounded px-2 py-1 text-sm">
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
          </select>
        </div>
      </div>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.md5.output') }}</Label>
        <Textarea v-model="outputText" readonly rows="4" class="font-mono bg-muted" />
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="copyOutput" :disabled="!outputText">
            {{ t('views.crypto.copy') }}
          </Button>
          <Button variant="outline" size="sm" @click="clearAll">
            {{ t('views.crypto.clear') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
