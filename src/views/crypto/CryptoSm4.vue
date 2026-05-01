<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { sm4 } from 'sm-crypto'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormLabel as Label } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const { t } = useI18n()
const { copy } = useClipboard()

const inputText = ref('')
const outputText = ref('')
const key = ref('')
const mode = ref<'encrypt' | 'decrypt'>('encrypt')

function processSM4() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  if (!key.value || key.value.length !== 32) {
    toast.error(t('views.crypto.sm4.invalidKey'))
    return
  }

  try {
    if (mode.value === 'encrypt') {
      outputText.value = sm4.encrypt(inputText.value, key.value)
    } else {
      outputText.value = sm4.decrypt(inputText.value, key.value)
    }
  } catch {
    toast.error(t('views.crypto.sm4.error'))
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

function generateKey() {
  // 生成32位十六进制密钥（128位）
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  key.value = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  toast.success(t('views.crypto.sm4.keyGenerated'))
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.sm4.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.sm4.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Mode Selection -->
      <div class="flex gap-2">
        <Button :variant="mode === 'encrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'encrypt'">
          {{ t('views.crypto.sm4.encrypt') }}
        </Button>
        <Button :variant="mode === 'decrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'decrypt'">
          {{ t('views.crypto.sm4.decrypt') }}
        </Button>
      </div>

      <!-- Key Input -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.sm4.key') }}</Label>
        <div class="flex gap-2">
          <Input
            v-model="key"
            :placeholder="t('views.crypto.sm4.keyPlaceholder')"
            class="font-mono flex-1"
            maxlength="32"
          />
          <Button variant="outline" size="sm" @click="generateKey">
            {{ t('views.crypto.sm4.generateKey') }}
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">{{ t('views.crypto.sm4.keyHint') }}</p>
      </div>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.sm4.inputPlain') : t('views.crypto.sm4.inputCipher') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'encrypt'
              ? t('views.crypto.sm4.inputPlainPlaceholder')
              : t('views.crypto.sm4.inputCipherPlaceholder')
          "
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Process Button -->
      <Button @click="processSM4" :disabled="!inputText || !key">
        {{ mode === 'encrypt' ? t('views.crypto.sm4.encrypt') : t('views.crypto.sm4.decrypt') }}
      </Button>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.sm4.outputCipher') : t('views.crypto.sm4.outputPlain') }}</Label>
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
