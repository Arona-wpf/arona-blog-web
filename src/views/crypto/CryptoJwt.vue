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

const inputToken = ref('')
const decodedHeader = ref('')
const decodedPayload = ref('')
const signatureInfo = ref('')
const tokenStatus = ref<'valid' | 'invalid' | 'empty'>('empty')

interface JWTHeader {
  alg?: string
  typ?: string
  [key: string]: unknown
}

interface JWTPayload {
  [key: string]: unknown
}

function decodeJWT() {
  if (!inputToken.value) {
    decodedHeader.value = ''
    decodedPayload.value = ''
    signatureInfo.value = ''
    tokenStatus.value = 'empty'
    return
  }

  try {
    const parts = inputToken.value.split('.')
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      tokenStatus.value = 'invalid'
      toast.error(t('views.crypto.jwt.invalidFormat'))
      return
    }

    // Decode header
    const [headerPart, payloadPart, signaturePart] = parts
    const headerJson = atob(headerPart)
    const header: JWTHeader = JSON.parse(headerJson)
    decodedHeader.value = JSON.stringify(header, null, 2)

    // Decode payload
    const payloadJson = atob(payloadPart)
    const payload: JWTPayload = JSON.parse(payloadJson)
    decodedPayload.value = JSON.stringify(payload, null, 2)

    // Signature info (cannot verify without secret)
    signatureInfo.value = signaturePart

    tokenStatus.value = 'valid'
  } catch {
    tokenStatus.value = 'invalid'
    toast.error(t('views.crypto.jwt.decodeError'))
    decodedHeader.value = ''
    decodedPayload.value = ''
    signatureInfo.value = ''
  }
}

function copyHeader() {
  if (!decodedHeader.value) return
  copy(decodedHeader.value).then(() => {
    toast.success(t('views.crypto.copySuccess'))
  })
}

function copyPayload() {
  if (!decodedPayload.value) return
  copy(decodedPayload.value).then(() => {
    toast.success(t('views.crypto.copySuccess'))
  })
}

function copySignature() {
  if (!signatureInfo.value) return
  copy(signatureInfo.value).then(() => {
    toast.success(t('views.crypto.copySuccess'))
  })
}

function clearAll() {
  inputToken.value = ''
  decodedHeader.value = ''
  decodedPayload.value = ''
  signatureInfo.value = ''
  tokenStatus.value = 'empty'
}

// Check if payload has expiration
function getExpirationInfo(): string {
  if (!decodedPayload.value) return ''
  try {
    const payload = JSON.parse(decodedPayload.value)
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000)
      const now = new Date()
      if (expDate < now) {
        return t('views.crypto.jwt.expired', { date: expDate.toLocaleString() })
      }
      return t('views.crypto.jwt.validUntil', { date: expDate.toLocaleString() })
    }
  } catch {
    return ''
  }
  return ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.crypto.jwt.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.crypto.jwt.description') }}</p>
    </div>

    <div class="grid gap-6">
      <!-- Input Section -->
      <div class="space-y-3">
        <Label>{{ t('views.crypto.jwt.input') }}</Label>
        <Textarea
          v-model="inputToken"
          :placeholder="t('views.crypto.jwt.inputPlaceholder')"
          rows="3"
          class="font-mono"
          @input="decodeJWT"
        />
        <div class="flex gap-2">
          <Button size="sm" @click="decodeJWT" :disabled="!inputToken">
            {{ t('views.crypto.jwt.decode') }}
          </Button>
          <Button variant="outline" size="sm" @click="clearAll">
            {{ t('views.crypto.clear') }}
          </Button>
        </div>
      </div>

      <!-- Status Indicator -->
      <div v-if="tokenStatus !== 'empty'" class="flex items-center gap-2">
        <span
          :class="[
            'px-2 py-1 rounded text-xs font-medium',
            tokenStatus === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]"
        >
          {{ tokenStatus === 'valid' ? t('views.crypto.jwt.statusValid') : t('views.crypto.jwt.statusInvalid') }}
        </span>
        <span v-if="getExpirationInfo()" class="text-sm text-muted-foreground">
          {{ getExpirationInfo() }}
        </span>
      </div>

      <!-- Header Section -->
      <div v-if="decodedHeader" class="space-y-3">
        <div class="flex items-center justify-between">
          <Label>{{ t('views.crypto.jwt.header') }}</Label>
          <Button variant="outline" size="sm" @click="copyHeader">
            {{ t('views.crypto.copy') }}
          </Button>
        </div>
        <Textarea v-model="decodedHeader" readonly rows="4" class="font-mono bg-muted" />
      </div>

      <!-- Payload Section -->
      <div v-if="decodedPayload" class="space-y-3">
        <div class="flex items-center justify-between">
          <Label>{{ t('views.crypto.jwt.payload') }}</Label>
          <Button variant="outline" size="sm" @click="copyPayload">
            {{ t('views.crypto.copy') }}
          </Button>
        </div>
        <Textarea v-model="decodedPayload" readonly rows="6" class="font-mono bg-muted" />
      </div>

      <!-- Signature Section -->
      <div v-if="signatureInfo" class="space-y-3">
        <div class="flex items-center justify-between">
          <Label>{{ t('views.crypto.jwt.signature') }}</Label>
          <Button variant="outline" size="sm" @click="copySignature">
            {{ t('views.crypto.copy') }}
          </Button>
        </div>
        <Textarea :model-value="signatureInfo" readonly rows="2" class="font-mono bg-muted" />
        <p class="text-xs text-muted-foreground">{{ t('views.crypto.jwt.signatureNote') }}</p>
      </div>
    </div>
  </div>
</template>
