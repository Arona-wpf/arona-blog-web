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
const iv = ref('')
const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const keySize = ref<128 | 192 | 256>(256)
const outputEncoding = ref<'hex' | 'base64'>('base64')

function processAES() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  if (!key.value) {
    toast.error(t('views.crypto.aes.needKey'))
    return
  }

  try {
    // 根据密钥长度截取密钥
    const keyBytes = CryptoJS.enc.Utf8.parse(key.value.padEnd(keySize.value / 8, '0').slice(0, keySize.value / 8))

    // 处理 IV
    const ivBytes = iv.value
      ? CryptoJS.enc.Utf8.parse(iv.value.padEnd(16, '0').slice(0, 16))
      : CryptoJS.lib.WordArray.random(16)

    if (mode.value === 'encrypt') {
      const encrypted = CryptoJS.AES.encrypt(inputText.value, keyBytes, {
        iv: ivBytes,
        mode: CryptoJS.mode.CBC,
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

      const decrypted = CryptoJS.AES.decrypt({ ciphertext } as CryptoJS.lib.CipherParams, keyBytes, {
        iv: ivBytes,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      outputText.value = decrypted.toString(CryptoJS.enc.Utf8)
    }
  } catch {
    toast.error(t('views.crypto.aes.error'))
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
  const array = new Uint8Array(keySize.value / 8)
  crypto.getRandomValues(array)
  key.value = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  toast.success(t('views.crypto.aes.keyGenerated'))
}

function generateIV() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  iv.value = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.aes.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.aes.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Mode Selection -->
      <div class="flex gap-2">
        <Button :variant="mode === 'encrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'encrypt'">
          {{ t('views.crypto.aes.encrypt') }}
        </Button>
        <Button :variant="mode === 'decrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'decrypt'">
          {{ t('views.crypto.aes.decrypt') }}
        </Button>
      </div>

      <!-- Key Size Selection -->
      <div class="flex items-center gap-4">
        <Label class="text-sm">{{ t('views.crypto.aes.keySize') }}</Label>
        <select v-model="keySize" class="border rounded px-2 py-1 text-sm">
          <option :value="128">128-bit</option>
          <option :value="192">192-bit</option>
          <option :value="256">256-bit</option>
        </select>
      </div>

      <!-- Key Input -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.aes.key') }}</Label>
        <div class="flex gap-2">
          <Input v-model="key" :placeholder="t('views.crypto.aes.keyPlaceholder')" class="font-mono flex-1" />
          <Button variant="outline" size="sm" @click="generateKey">
            {{ t('views.crypto.aes.generateKey') }}
          </Button>
        </div>
      </div>

      <!-- IV Input -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.aes.iv') }}</Label>
        <div class="flex gap-2">
          <Input
            v-model="iv"
            :placeholder="t('views.crypto.aes.ivPlaceholder')"
            class="font-mono flex-1"
            maxlength="16"
          />
          <Button variant="outline" size="sm" @click="generateIV">
            {{ t('views.crypto.aes.generateIV') }}
          </Button>
        </div>
        <p class="text-xs text-muted-foreground">{{ t('views.crypto.aes.ivHint') }}</p>
      </div>

      <!-- Output Encoding -->
      <div class="flex items-center gap-4">
        <Label class="text-sm">{{ t('views.crypto.aes.outputEncoding') }}</Label>
        <select v-model="outputEncoding" class="border rounded px-2 py-1 text-sm">
          <option value="base64">Base64</option>
          <option value="hex">Hex</option>
        </select>
      </div>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.aes.inputPlain') : t('views.crypto.aes.inputCipher') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'encrypt'
              ? t('views.crypto.aes.inputPlainPlaceholder')
              : t('views.crypto.aes.inputCipherPlaceholder')
          "
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Process Button -->
      <Button @click="processAES" :disabled="!inputText || !key">
        {{ mode === 'encrypt' ? t('views.crypto.aes.encrypt') : t('views.crypto.aes.decrypt') }}
      </Button>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.aes.outputCipher') : t('views.crypto.aes.outputPlain') }}</Label>
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
