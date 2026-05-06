<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormLabel as Label } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const { t } = useI18n()
const { copy } = useClipboard()

const inputText = ref('')
const outputText = ref('')
const shaAlgorithm = ref('SHA-256')
const outputEncoding = ref('hex')

const algorithms = [
  { value: 'SHA-1', label: 'SHA-1' },
  { value: 'SHA-224', label: 'SHA-224' },
  { value: 'SHA-256', label: 'SHA-256' },
  { value: 'SHA-384', label: 'SHA-384' },
  { value: 'SHA-512', label: 'SHA-512' }
]

async function generateHash() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(inputText.value)
    const hashBuffer = await crypto.subtle.digest(shaAlgorithm.value, data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    if (outputEncoding.value === 'hex') {
      outputText.value = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    } else {
      outputText.value = btoa(String.fromCharCode(...hashArray))
    }
  } catch {
    toast.error(t('views.crypto.sha.error'))
  }
}

watch([inputText, shaAlgorithm, outputEncoding], () => {
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
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.sha.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.sha.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.sha.input') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="t('views.crypto.sha.inputPlaceholder')"
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Algorithm and Encoding Options -->
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <Label class="text-sm">{{ t('views.crypto.sha.algorithm') }}</Label>
          <Select v-model="shaAlgorithm">
            <SelectTrigger class="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="algo in algorithms" :key="algo.value" :value="algo.value">
                {{ algo.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex items-center gap-2">
          <Label class="text-sm">{{ t('views.crypto.sha.outputEncoding') }}</Label>
          <Select v-model="outputEncoding">
            <SelectTrigger class="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">Hex</SelectItem>
              <SelectItem value="base64">Base64</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.sha.output') }}</Label>
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
