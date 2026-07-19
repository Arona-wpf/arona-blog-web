<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { UserListItem } from '@/fetch/user/types'

const props = defineProps<{
  open: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()

const { t } = useI18n()

const isAdministrator = computed(() => props.user?.roles?.includes('administrator'))

function handleOpenChange(open: boolean) {
  emit('update:open', open)
}

function handleConfirm() {
  if (isAdministrator.value) return
  emit('confirm')
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ isAdministrator ? t('views.manage.user.cannotDeleteAdmin') : t('views.manage.user.confirmDelete') }}
        </DialogTitle>
        <DialogDescription>
          <template v-if="isAdministrator">
            {{ t('views.manage.user.cannotDeleteAdminDesc', { account: props.user?.account || '' }) }}
          </template>
          <template v-else>
            {{ t('views.manage.user.confirmDeleteDesc', { account: props.user?.account || '' }) }}
          </template>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="flex-row justify-end gap-3">
        <Button variant="outline" @click="handleOpenChange(false)">
          {{ t('global.action.close') }}
        </Button>
        <Button v-if="!isAdministrator" variant="destructive" @click="handleConfirm">
          {{ t('views.manage.user.delete') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
