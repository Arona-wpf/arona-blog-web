<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { FormLabel as Label } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const { t } = useI18n()
const { copy } = useClipboard()

const publicKey = ref('')
const privateKey = ref('')
const inputPlain = ref('')
const inputCipher = ref('')
const outputCipher = ref('')
const outputPlain = ref('')
const mode = ref('encrypt')
const keySize = ref(2048)

// RSA 使用 Web Crypto API
async function generateKeyPair() {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: keySize.value,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    )

    // 导出公钥
    const publicKeyExported = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    publicKey.value = btoa(String.fromCharCode(...new Uint8Array(publicKeyExported)))

    // 导出私钥
    const privateKeyExported = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
    privateKey.value = btoa(String.fromCharCode(...new Uint8Array(privateKeyExported)))

    toast.success(t('views.crypto.rsa.keyPairGenerated'))
  } catch {
    toast.error(t('views.crypto.rsa.error'))
  }
}

async function encrypt() {
  if (!publicKey.value) {
    toast.error(t('views.crypto.rsa.needPublicKey'))
    return
  }
  if (!inputPlain.value) {
    outputCipher.value = ''
    return
  }

  try {
    // 导入公钥
    const publicKeyData = Uint8Array.from(atob(publicKey.value), (c) => c.charCodeAt(0))
    const importedPublicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyData,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    )

    // 加密
    const encoder = new TextEncoder()
    const data = encoder.encode(inputPlain.value)
    const encryptedBuffer = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, importedPublicKey, data)
    outputCipher.value = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
  } catch {
    toast.error(t('views.crypto.rsa.encryptError'))
  }
}

async function decrypt() {
  if (!privateKey.value) {
    toast.error(t('views.crypto.rsa.needPrivateKey'))
    return
  }
  if (!inputCipher.value) {
    outputPlain.value = ''
    return
  }

  try {
    // 导入私钥
    const privateKeyData = Uint8Array.from(atob(privateKey.value), (c) => c.charCodeAt(0))
    const importedPrivateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyData,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['decrypt']
    )

    // 解密
    const encryptedData = Uint8Array.from(atob(inputCipher.value), (c) => c.charCodeAt(0))
    const decryptedBuffer = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, importedPrivateKey, encryptedData)
    const decoder = new TextDecoder()
    outputPlain.value = decoder.decode(decryptedBuffer)
  } catch {
    toast.error(t('views.crypto.rsa.decryptError'))
  }
}

function copyText(text: string) {
  if (!text) return
  copy(text).then(() => {
    toast.success(t('views.crypto.copySuccess'))
  })
}

function clearAll() {
  publicKey.value = ''
  privateKey.value = ''
  inputPlain.value = ''
  inputCipher.value = ''
  outputCipher.value = ''
  outputPlain.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.rsa.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.rsa.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Key Generation Section -->
      <div class="space-y-4 rounded-lg border p-4">
        <h3 class="font-medium">{{ t('views.crypto.rsa.keyGeneration') }}</h3>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <Label class="text-sm">{{ t('views.crypto.rsa.keySize') }}</Label>
            <Select v-model="keySize">
              <SelectTrigger class="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="512">512 bit</SelectItem>
                <SelectItem :value="1024">1024 bit</SelectItem>
                <SelectItem :value="2048">2048 bit</SelectItem>
                <SelectItem :value="4096">4096 bit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" @click="generateKeyPair">{{ t('views.crypto.rsa.generateKeyPair') }}</Button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label>{{ t('views.crypto.rsa.publicKey') }}</Label>
            <Textarea
              v-model="publicKey"
              :placeholder="t('views.crypto.rsa.publicKeyPlaceholder')"
              rows="4"
              class="font-mono"
            />
            <Button variant="outline" size="sm" @click="copyText(publicKey)" :disabled="!publicKey">
              {{ t('views.crypto.copy') }}
            </Button>
          </div>
          <div class="space-y-2">
            <Label>{{ t('views.crypto.rsa.privateKey') }}</Label>
            <Textarea
              v-model="privateKey"
              :placeholder="t('views.crypto.rsa.privateKeyPlaceholder')"
              rows="4"
              class="font-mono"
            />
            <Button variant="outline" size="sm" @click="copyText(privateKey)" :disabled="!privateKey">
              {{ t('views.crypto.copy') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Mode Toggle -->
      <div class="flex gap-2">
        <Button :variant="mode === 'encrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'encrypt'">
          {{ t('views.crypto.rsa.encrypt') }}
        </Button>
        <Button :variant="mode === 'decrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'decrypt'">
          {{ t('views.crypto.rsa.decrypt') }}
        </Button>
      </div>

      <!-- Encrypt Section -->
      <div v-if="mode === 'encrypt'" class="space-y-4">
        <div class="space-y-3">
          <Label>{{ t('views.crypto.rsa.inputPlain') }}</Label>
          <Textarea
            v-model="inputPlain"
            :placeholder="t('views.crypto.rsa.inputPlainPlaceholder')"
            rows="4"
            class="font-mono"
          />
        </div>
        <Button @click="encrypt" :disabled="!publicKey || !inputPlain">{{ t('views.crypto.rsa.encryptBtn') }}</Button>
        <div class="space-y-3">
          <Label>{{ t('views.crypto.rsa.outputCipher') }}</Label>
          <Textarea v-model="outputCipher" readonly rows="4" class="font-mono bg-muted" />
          <Button variant="outline" size="sm" @click="copyText(outputCipher)" :disabled="!outputCipher">
            {{ t('views.crypto.copy') }}
          </Button>
        </div>
      </div>

      <!-- Decrypt Section -->
      <div v-if="mode === 'decrypt'" class="space-y-4">
        <div class="space-y-3">
          <Label>{{ t('views.crypto.rsa.inputCipher') }}</Label>
          <Textarea
            v-model="inputCipher"
            :placeholder="t('views.crypto.rsa.inputCipherPlaceholder')"
            rows="4"
            class="font-mono"
          />
        </div>
        <Button @click="decrypt" :disabled="!privateKey || !inputCipher">
          {{ t('views.crypto.rsa.decryptBtn') }}
        </Button>
        <div class="space-y-3">
          <Label>{{ t('views.crypto.rsa.outputPlain') }}</Label>
          <Textarea v-model="outputPlain" readonly rows="4" class="font-mono bg-muted" />
          <Button variant="outline" size="sm" @click="copyText(outputPlain)" :disabled="!outputPlain">
            {{ t('views.crypto.copy') }}
          </Button>
        </div>
      </div>

      <Button variant="outline" size="sm" @click="clearAll">{{ t('views.crypto.clear') }}</Button>
    </div>
  </div>
</template>
