<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

const { t } = useI18n()
const { copy } = useClipboard()

const password = ref('')
const lengthInput = ref('16')
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(false)
const copied = ref(false)

const MIN_LENGTH = 8
const MAX_LENGTH = 128

const charset = computed(() => {
  let chars = ''
  if (includeUppercase.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (includeLowercase.value) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (includeNumbers.value) chars += '0123456789'
  if (includeSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  return chars
})

function clampLength(value: number): number {
  return Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, value))
}

function getLength(): number {
  const parsed = parseInt(lengthInput.value, 10)
  if (isNaN(parsed) || parsed < MIN_LENGTH) return MIN_LENGTH
  if (parsed > MAX_LENGTH) return MAX_LENGTH
  return parsed
}

function generatePassword() {
  if (charset.value.length === 0) {
    password.value = ''
    return
  }
  const len = getLength()
  let result = ''
  const array = new Uint32Array(len)
  crypto.getRandomValues(array)
  for (let i = 0; i < len; i++) {
    const randomIndex = array[i] ?? 0
    result += charset.value[randomIndex % charset.value.length]
  }
  password.value = result
  copied.value = false
}

watch([lengthInput, includeUppercase, includeLowercase, includeNumbers, includeSymbols], () => {
  generatePassword()
})

function copyPassword() {
  if (!password.value) return
  copy(password.value).then(() => {
    toast.success(t('views.dev.copySuccess'))
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.password.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.password.description') }}</p>
    </div>

    <div class="space-y-4">
      <!-- Password Display -->
      <div class="flex gap-2">
        <Input
          v-model="password"
          type="text"
          readonly
          class="font-mono text-lg"
          :placeholder="t('views.dev.password.placeholder')"
        />
        <Button @click="copyPassword" :disabled="!password">
          {{ copied ? t('views.dev.password.copied') : t('views.dev.password.copy') }}
        </Button>
      </div>

      <!-- Length Input -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">{{ t('views.dev.password.length') }}</label>
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

      <!-- Character Options -->
      <div class="flex flex-col gap-3">
        <label class="text-sm font-medium">{{ t('views.dev.password.charset') }}</label>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <Checkbox id="uppercase" v-model:checked="includeUppercase" />
            <label for="uppercase" class="text-sm cursor-pointer">
              {{ t('views.dev.password.uppercase') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="lowercase" v-model:checked="includeLowercase" />
            <label for="lowercase" class="text-sm cursor-pointer">
              {{ t('views.dev.password.lowercase') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="numbers" v-model:checked="includeNumbers" />
            <label for="numbers" class="text-sm cursor-pointer">
              {{ t('views.dev.password.numbers') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="symbols" v-model:checked="includeSymbols" />
            <label for="symbols" class="text-sm cursor-pointer">
              {{ t('views.dev.password.symbols') }}
            </label>
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <Button @click="generatePassword" class="w-full">
        {{ t('views.dev.password.generate') }}
      </Button>
    </div>
  </div>
</template>
