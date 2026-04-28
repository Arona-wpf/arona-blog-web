<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Check, Copy } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const { t } = useI18n()
const { copy } = useClipboard()

const input = ref('')
const output = ref('')
const error = ref('')
const indent = ref(2)
const copied = ref(false)

const indentOptions = [2, 4]

function formatJson() {
  error.value = ''
  output.value = ''

  if (!input.value.trim()) {
    return
  }

  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed, null, indent.value)
  } catch (e) {
    if (e instanceof SyntaxError) {
      error.value = e.message
    } else {
      error.value = t('views.dev.json.parseError')
    }
  }
}

function compressJson() {
  error.value = ''
  output.value = ''

  if (!input.value.trim()) {
    return
  }

  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed)
  } catch (e) {
    if (e instanceof SyntaxError) {
      error.value = e.message
    } else {
      error.value = t('views.dev.json.parseError')
    }
  }
}

function clearAll() {
  input.value = ''
  output.value = ''
  error.value = ''
}

const isValid = computed(() => {
  if (!input.value.trim()) return null
  try {
    JSON.parse(input.value)
    return true
  } catch {
    return false
  }
})

function copyOutput() {
  if (!output.value) return
  copy(output.value).then(() => {
    toast.success(t('views.dev.copySuccess'))
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.dev.json.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.dev.json.description') }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <!-- Input Area -->
      <div class="space-y-2 min-w-0">
        <div class="flex items-center justify-between h-8">
          <label class="text-sm font-medium">{{ t('views.dev.json.input') }}</label>
          <span
            v-if="isValid !== null"
            class="text-xs px-2 py-0.5 rounded"
            :class="
              isValid
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            "
          >
            {{ isValid ? t('views.dev.json.valid') : t('views.dev.json.invalid') }}
          </span>
        </div>
        <Textarea
          v-model="input"
          class="min-h-[300px] font-mono resize-y"
          :placeholder="t('views.dev.json.inputPlaceholder')"
        />
      </div>

      <!-- Output Area -->
      <div class="space-y-2 min-w-0">
        <div class="flex items-center justify-between h-8">
          <label class="text-sm font-medium">{{ t('views.dev.json.output') }}</label>
          <Button variant="outline" size="sm" @click="copyOutput" :disabled="!output">
            <Check v-if="copied" class="size-4" />
            <Copy v-else class="size-4" />
            {{ copied ? t('views.dev.json.copied') : t('views.dev.json.copy') }}
          </Button>
        </div>
        <Textarea
          v-model="output"
          readonly
          class="min-h-[300px] font-mono resize-y"
          :placeholder="t('views.dev.json.outputPlaceholder')"
        />
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
      <p class="text-red-600 dark:text-red-400 text-sm font-medium">{{ t('views.dev.json.error') }}</p>
      <p class="text-red-500 dark:text-red-300 text-sm">{{ error }}</p>
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap gap-2">
      <Button @click="formatJson" :disabled="!input.trim()">
        {{ t('views.dev.json.format') }}
      </Button>
      <Button variant="outline" @click="compressJson" :disabled="!input.trim()">
        {{ t('views.dev.json.compress') }}
      </Button>
      <Button variant="destructive" @click="clearAll">
        {{ t('views.dev.json.clear') }}
      </Button>

      <div class="flex items-center gap-2 ml-auto">
        <label class="text-sm">{{ t('views.dev.json.indent') }}</label>
        <select v-model="indent" class="border rounded px-2 py-1 text-sm bg-background">
          <option v-for="opt in indentOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>
  </div>
</template>
