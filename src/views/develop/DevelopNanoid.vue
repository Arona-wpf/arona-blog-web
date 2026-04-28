<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const { t } = useI18n()
const { copy } = useClipboard()

const nanoid = ref('')
const lengthInput = ref('21')
const copied = ref(false)

const MIN_LENGTH = 8
const MAX_LENGTH = 128

// URL-safe characters for NanoID
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'

function clampLength(value: number): number {
  return Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, value))
}

function getLength(): number {
  const parsed = parseInt(lengthInput.value, 10)
  if (isNaN(parsed) || parsed < MIN_LENGTH) return MIN_LENGTH
  if (parsed > MAX_LENGTH) return MAX_LENGTH
  return parsed
}

function generateNanoid() {
  const len = getLength()
  let result = ''
  const array = new Uint32Array(len)
  crypto.getRandomValues(array)
  for (let i = 0; i < len; i++) {
    const randomIndex = array[i] ?? 0
    result += charset[randomIndex % charset.length]
  }
  nanoid.value = result
  copied.value = false
}

watch(lengthInput, () => {
  generateNanoid()
})

function copyNanoid() {
  if (!nanoid.value) return
  copy(nanoid.value).then(() => {
    toast.success(t('views.dev.copySuccess'))

    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.nanoid.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.nanoid.description') }}</p>
    </div>

    <div class="space-y-4">
      <!-- NanoID Display -->
      <div class="flex gap-2">
        <Input
          v-model="nanoid"
          type="text"
          readonly
          class="font-mono text-lg"
          :placeholder="t('views.dev.nanoid.placeholder')"
        />
        <Button @click="copyNanoid" :disabled="!nanoid">
          {{ copied ? t('views.dev.nanoid.copied') : t('views.dev.nanoid.copy') }}
        </Button>
      </div>

      <!-- Length Input -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.nanoid.length') }}</label>
        <div class="flex items-center gap-2">
          <Input
            v-model="lengthInput"
            type="number"
            :min="MIN_LENGTH"
            :max="MAX_LENGTH"
            class="w-[180px]"
            @blur="lengthInput = String(clampLength(getLength()))"
          />
          <span class="text-muted-foreground text-xs">({{ MIN_LENGTH }}-{{ MAX_LENGTH }})</span>
        </div>
      </div>

      <!-- Generate Button -->
      <Button @click="generateNanoid" class="w-full">
        {{ t('views.dev.nanoid.generate') }}
      </Button>
    </div>
  </div>
</template>
