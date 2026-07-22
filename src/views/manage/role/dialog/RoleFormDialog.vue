<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollBody,
  DialogTitle
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_permission_list } from '@/fetch/permission'
import type { PermissionListItem } from '@/fetch/permission/types'
import { pr_v1_role_update } from '@/fetch/role'
import type { RoleListItem } from '@/fetch/role/types'

import PermissionSelect from '../../components/PermissionSelect.vue'

const props = defineProps<{
  open: boolean
  mode: 'edit'
  role: RoleListItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const submitting = ref(false)

// 权限列表
const apiPermissions = ref<PermissionListItem[]>([])
const menuPermissions = ref<PermissionListItem[]>([])
const permissionsLoading = ref(false)

// 选中的权限
const selectedApiPermissions = ref<string[]>([])
const selectedMenuPermissions = ref<string[]>([])

// 加载权限列表
async function loadPermissions() {
  if (apiPermissions.value.length > 0) return

  permissionsLoading.value = true
  try {
    const res = await pr_v1_permission_list({
      current_page: 1,
      page_size: 100
    })
    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      apiPermissions.value = res.data.list.filter((p) => p.type === 'api')
      menuPermissions.value = res.data.list.filter((p) => p.type === 'menu')
    }
  } catch {
    // 错误已处理
  } finally {
    permissionsLoading.value = false
  }
}

// 监听对话框打开，初始化表单
watch(
  () => props.open,
  (open) => {
    if (open) {
      loadPermissions()
      if (props.role) {
        selectedApiPermissions.value = props.role.api_permissions ?? []
        selectedMenuPermissions.value = props.role.menu_permissions ?? []
      }
    }
  }
)

// 提交表单
async function onSubmit() {
  if (submitting.value || !props.role) return

  submitting.value = true
  try {
    const res = await pr_v1_role_update({
      _id: props.role._id,
      api_permissions: selectedApiPermissions.value,
      menu_permissions: selectedMenuPermissions.value
    })
    if (res.code === ResponseCodeEnum.SUCCESS) {
      toast.success(t('views.manage.role.updateSuccess'))
      emit('update:open', false)
      emit('success')
    }
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
function handleOpenChange(open: boolean) {
  if (!submitting.value) {
    emit('update:open', open)
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="flex max-h-[90vh] flex-col sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ t('views.manage.role.edit') }}</DialogTitle>
        <DialogDescription>
          {{ t('views.manage.role.subtitle') }}
        </DialogDescription>
      </DialogHeader>

      <Form class="flex min-h-0 flex-1 flex-col" name="roleForm" @submit="onSubmit">
        <DialogScrollBody class="space-y-4">
          <div class="space-y-1">
            <p class="text-sm font-medium">{{ t('views.manage.role.name') }}</p>
            <p class="text-muted-foreground text-sm">{{ props.role?.name }}</p>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium">{{ t('views.manage.role.code') }}</p>
            <p class="text-muted-foreground text-sm">{{ props.role?.code }}</p>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-medium">{{ t('views.manage.role.apiPermissions') }}</p>
            <PermissionSelect
              v-model="selectedApiPermissions"
              :permissions="apiPermissions"
              :loading="permissionsLoading"
              type="api"
            />
          </div>

          <div class="space-y-2">
            <p class="text-sm font-medium">{{ t('views.manage.role.menuPermissions') }}</p>
            <PermissionSelect
              v-model="selectedMenuPermissions"
              :permissions="menuPermissions"
              :loading="permissionsLoading"
              type="menu"
            />
          </div>
        </DialogScrollBody>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="submitting" @click="handleOpenChange(false)">
            {{ t('global.action.close') }}
          </Button>
          <Button type="submit" :loading="submitting" :disabled="submitting">
            {{ t('views.manage.role.edit') }}
          </Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
