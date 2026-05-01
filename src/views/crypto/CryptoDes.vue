<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import CryptoJS from 'crypto-js'
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
const outputEncoding = ref<'hex' | 'base64'>('base64')

function processDES() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  if (!key.value || key.value.length < 8) {
    toast.error(t('views.crypto.des.invalidKey'))
    return
  }

  try {
    // DES 密钥需要 8 字节
    const keyBytes = CryptoJS.enc.Utf8.parse(key.value.padEnd(8, '0').slice(0, 8))

    if (mode.value === 'encrypt') {
      const encrypted = CryptoJS.DES.encrypt(inputText.value, keyBytes, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
      outputText.value = outputEncoding.value === 'hex' ? encrypted.ciphertext.toString() : encrypted.toString()
    } else {
      // 解密
      let ciphertext: CryptoJS.lib.WordArray
      if (outputEncoding.value === 'hex') {
        ciphertext = CryptoJS.enc.Hex.parse(inputText.value)
      } else {
        ciphertext = CryptoJS.enc.Base64.parse(inputText.value)
      }

      const decrypted = CryptoJS.DES.decrypt({ ciphertext } as CryptoJS.lib.CipherParams, keyBytes, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
      outputText.value = decrypted.toString(CryptoJS.enc.Utf8)
    }
  } catch {
    toast.error(t('views.crypto.des.error'))
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
  const array = new Uint8Array(8)
  crypto.getRandomValues(array)
  key.value = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  toast.success(t('views.crypto.des.keyGenerated'))
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.des.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.des.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Warning -->
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          {{ t('views.crypto.des.warning') }}
        </p>
      </div>

      <!-- Mode Selection -->
      <div class="flex gap-2">
        <Button :variant="mode === 'encrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'encrypt'">
          {{ t('views.crypto.des.encrypt') }}
        </Button>
        <Button :variant="mode === 'decrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'decrypt'">
          {{ t('views.crypto.des.decrypt') }}
        </Button>
      </div>

      <!-- Key Input -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.des.key') }}</Label>
        <div class="flex gap-2">
          <Input
            v-model="key"
            :placeholder="t('views.crypto.des.keyPlaceholder')"
            class="font-mono flex-1"
            maxlength="16"
          />
          <Button variant="outline" size="sm" @click="generateKey">
            {{ t('views.crypto.des.generateKey') }}
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">{{ t('views.crypto.des.keyHint') }}</p>
      </div>

      <!-- Output Encoding -->
      <div class="flex items-center gap-4">
        <Label class="text-sm">{{ t('views.crypto.des.outputEncoding') }}</Label>
        <select v-model="outputEncoding" class="border rounded px-2 py-1 text-sm">
          <option value="base64">Base64</option>
          <option value="hex">Hex</option>
        </select>
      </div>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.des.inputPlain') : t('views.crypto.des.inputCipher') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'encrypt'
              ? t('views.crypto.des.inputPlainPlaceholder')
              : t('views.crypto.des.inputCipherPlaceholder')
          "
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Process Button -->
      <Button @click="processDES" :disabled="!inputText || !key">
        {{ mode === 'encrypt' ? t('views.crypto.des.encrypt') : t('views.crypto.des.decrypt') }}
      </Button>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.des.outputCipher') : t('views.crypto.des.outputPlain') }}</Label>
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
