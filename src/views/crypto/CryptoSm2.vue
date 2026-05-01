<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { sm2 } from 'sm-crypto'
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
const publicKey = ref('')
const privateKey = ref('')
const mode = ref<'encrypt' | 'decrypt'>('encrypt')

function processSM2() {
  if (!inputText.value) {
    outputText.value = ''
    return
  }

  if (mode.value === 'encrypt' && !publicKey.value) {
    toast.error(t('views.crypto.sm2.needPublicKey'))
    return
  }

  if (mode.value === 'decrypt' && !privateKey.value) {
    toast.error(t('views.crypto.sm2.needPrivateKey'))
    return
  }

  try {
    if (mode.value === 'encrypt') {
      // SM2 加密，使用 C1C3C2 模式（sm-crypto 默认模式）
      // 公钥需要去掉 "04" 前缀（如果有）
      let pk = publicKey.value
      if (pk.startsWith('04')) {
        pk = pk.slice(2)
      }
      outputText.value = sm2.doEncrypt(inputText.value, pk, 1)
    } else {
      // SM2 解密
      outputText.value = sm2.doDecrypt(inputText.value, privateKey.value, 1)
    }
  } catch {
    toast.error(t('views.crypto.sm2.error'))
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

function generateKeyPair() {
  const keyPair = sm2.generateKeyPairHex()
  publicKey.value = keyPair.publicKey
  privateKey.value = keyPair.privateKey
  toast.success(t('views.crypto.sm2.keyPairGenerated'))
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.sm2.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.sm2.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Mode Selection -->
      <div class="flex gap-2">
        <Button :variant="mode === 'encrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'encrypt'">
          {{ t('views.crypto.sm2.encrypt') }}
        </Button>
        <Button :variant="mode === 'decrypt' ? 'default' : 'outline'" size="sm" @click="mode = 'decrypt'">
          {{ t('views.crypto.sm2.decrypt') }}
        </Button>
      </div>

      <!-- Key Input -->
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-3">
          <Label>{{ t('views.crypto.sm2.publicKey') }}</Label>
          <Input v-model="publicKey" :placeholder="t('views.crypto.sm2.publicKeyPlaceholder')" class="font-mono" />
        </div>
        <div class="space-y-3">
          <Label>{{ t('views.crypto.sm2.privateKey') }}</Label>
          <Input v-model="privateKey" :placeholder="t('views.crypto.sm2.privateKeyPlaceholder')" class="font-mono" />
        </div>
      </div>

      <Button variant="outline" size="sm" @click="generateKeyPair">
        {{ t('views.crypto.sm2.generateKeyPair') }}
      </Button>

      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.sm2.inputPlain') : t('views.crypto.sm2.inputCipher') }}</Label>
        <Textarea
          v-model="inputText"
          :placeholder="
            mode === 'encrypt'
              ? t('views.crypto.sm2.inputPlainPlaceholder')
              : t('views.crypto.sm2.inputCipherPlaceholder')
          "
          rows="4"
          class="font-mono"
        />
      </div>

      <!-- Process Button -->
      <Button @click="processSM2" :disabled="!inputText">
        {{ mode === 'encrypt' ? t('views.crypto.sm2.encrypt') : t('views.crypto.sm2.decrypt') }}
      </Button>

      <!-- Output Section -->
      <div class="space-y-3">
        <Label>{{ mode === 'encrypt' ? t('views.crypto.sm2.outputCipher') : t('views.crypto.sm2.outputPlain') }}</Label>
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
