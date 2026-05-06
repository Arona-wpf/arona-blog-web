<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormLabel as Label } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const { t } = useI18n()
const { copy } = useClipboard()

const key = ref('')
const keyFormat = ref<'utf8' | 'base64' | 'hex'>('utf8')
const cipherFormat = ref<'hex' | 'base64'>('hex')
const inputText = ref('')
const outputText = ref('')
const mode = ref('encrypt')

function initSBox(keyBytes: Uint8Array): Uint8Array {
  const sBox = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    sBox[i] = i
  }

  let j = 0
  for (let i = 0; i < 256; i++) {
    j = (j + sBox[i]! + keyBytes[i % keyBytes.length]!) % 256
    const temp = sBox[i]!
    sBox[i] = sBox[j]!
    sBox[j] = temp
  }

  return sBox
}

function rc4Transform(keyBytes: Uint8Array, data: Uint8Array): Uint8Array {
  if (!keyBytes.length) {
    throw new Error('empty key')
  }

  const sBox = initSBox(keyBytes)
  const result = new Uint8Array(data.length)

  let i = 0
  let j = 0
  for (let n = 0; n < data.length; n++) {
    i = (i + 1) % 256
    j = (j + sBox[i]!) % 256

    const temp = sBox[i]!
    sBox[i] = sBox[j]!
    sBox[j] = temp

    const k = sBox[(sBox[i]! + sBox[j]!) % 256]!
    result[n] = data[n]! ^ k
  }

  return result
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function hexToBytes(hex: string): Uint8Array {
  const trimmed = hex.trim()
  if (trimmed.length % 2 !== 0 || /[^0-9a-fA-F]/.test(trimmed)) {
    throw new Error('invalid hex')
  }

  const bytes = new Uint8Array(trimmed.length / 2)
  for (let i = 0; i < trimmed.length; i += 2) {
    bytes[i / 2] = parseInt(trimmed.slice(i, i + 2), 16)
  }
  return bytes
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64.trim())
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function getKeyBytes(): Uint8Array {
  const trimmed = key.value.trim()
  if (!trimmed) {
    throw new Error('empty key')
  }

  switch (keyFormat.value) {
    case 'utf8':
      return new TextEncoder().encode(trimmed)
    case 'base64':
      return base64ToBytes(trimmed)
    case 'hex':
      return hexToBytes(trimmed)
  }
}

function rc4Encrypt(): string {
  const keyBytes = getKeyBytes()
  const plainBytes = new TextEncoder().encode(inputText.value)
  const cipherBytes = rc4Transform(keyBytes, plainBytes)

  return cipherFormat.value === 'hex' ? bytesToHex(cipherBytes) : bytesToBase64(cipherBytes)
}

function rc4Decrypt(): string {
  const keyBytes = getKeyBytes()

  let cipherBytes: Uint8Array
  if (cipherFormat.value === 'hex') {
    cipherBytes = hexToBytes(inputText.value)
  } else {
    cipherBytes = base64ToBytes(inputText.value)
  }

  const decryptedBytes = rc4Transform(keyBytes, cipherBytes)
  return new TextDecoder().decode(decryptedBytes)
}

function runRc4() {
  if (!key.value) {
    outputText.value = ''
    return
  }
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  try {
    if (mode.value === 'encrypt') {
      outputText.value = rc4Encrypt()
    } else {
      outputText.value = rc4Decrypt()
    }
  } catch {
    toast.error(t('views.crypto.rc4.error'))
    outputText.value = ''
  }
}

watch([key, keyFormat, cipherFormat, inputText, mode], () => {
  runRc4()
})

function generateKey() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  key.value = bytesToHex(array)
  toast.success(t('views.crypto.rc4.keyGenerated'))
}

function copyOutput() {
  if (!outputText.value) return
  copy(outputText.value).then(() => {
    toast.success(t('views.crypto.copySuccess'))
  })
}

function clearAll() {
  key.value = ''
  inputText.value = ''
  outputText.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.rc4.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.rc4.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Key Section -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.rc4.key') }}</Label>
        <div class="flex gap-2">
          <Input v-model="key" :placeholder="t('views.crypto.rc4.keyPlaceholder')" class="font-mono flex-1" />
          <Button variant="outline" size="sm" @click="generateKey">
            {{ t('views.crypto.rc4.generateKey') }}
          </Button>
        </div>
      </div>

      <!-- Key Format -->
      <div class="flex items-center gap-4">
        <Label class="text-sm">{{ t('views.crypto.rc4.keyFormat') }}</Label>
        <Select v-model="keyFormat">
          <SelectTrigger class="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="utf8">UTF-8</SelectItem>
            <SelectItem value="base64">Base64</SelectItem>
            <SelectItem value="hex">Hex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Cipher Format -->
      <div class="flex items-center gap-4">
        <Label class="text-sm">{{ t('views.crypto.rc4.cipherFormat') }}</Label>
        <Select v-model="cipherFormat">
          <SelectTrigger class="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hex">Hex</SelectItem>
            <SelectItem value="base64">Base64</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Mode Toggle -->
      <div class="flex gap-2">
        <Button :variant="mode === 'encrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'encrypt'">
          {{ t('views.crypto.rc4.encrypt') }}
        </Button>
        <Button :variant="mode === 'decrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'decrypt'">
          {{ t('views.crypto.rc4.decrypt') }}
        </Button>
      </div>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.rc4.inputPlain') : t('views.crypto.rc4.inputCipher') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'encrypt'
              ? t('views.crypto.rc4.inputPlainPlaceholder')
              : t('views.crypto.rc4.inputCipherPlaceholder')
          "
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.rc4.outputCipher') : t('views.crypto.rc4.outputPlain') }}</Label>
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
