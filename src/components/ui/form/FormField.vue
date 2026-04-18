<script setup lang="ts">
import { Field } from 'vee-validate'
import { computed } from 'vue'

const props = defineProps<{
  name: string
}>()

const fieldId = computed(() => `field-${props.name}`)
const messageId = computed(() => `field-${props.name}-message`)

defineSlots<{
  default?: (props: {
    componentField: object
    errors: string[]
    fieldId: string
    messageId: string
    invalid: boolean
  }) => unknown
}>()
</script>

<template>
  <Field v-slot="slotProps" :name="props.name">
    <div class="space-y-2">
      <slot
        v-bind="slotProps"
        :field-id="fieldId"
        :message-id="messageId"
        :invalid="Boolean(slotProps.errors?.length)"
      />
    </div>
  </Field>
</template>
