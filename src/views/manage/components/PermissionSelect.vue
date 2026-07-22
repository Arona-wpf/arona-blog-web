<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { PermissionListItem } from '@/fetch/permission/types'

const props = defineProps<{
  modelValue: string[]
  permissions: PermissionListItem[]
  loading?: boolean
  type: 'api' | 'menu'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { t } = useI18n()

// 分组后的权限
const groupedPermissions = computed(() => {
  const groups: Record<string, PermissionListItem[]> = {}
  for (const permission of props.permissions) {
    if (!groups[permission.group]) {
      groups[permission.group] = []
    }
    groups[permission.group]?.push(permission)
  }
  return groups
})

// 分组名称映射
const groupNames: Record<string, string> = {
  user: 'views.manage.permission.groupUser',
  role: 'views.manage.permission.groupRole',
  permission: 'views.manage.permission.groupPermission',
  log: 'views.manage.permission.groupLog'
}

// 是否全选
const isAllSelected = computed(() => {
  return props.permissions.length > 0 && props.permissions.every((p) => props.modelValue.includes(p._id))
})

// 是否部分选中
const isIndeterminate = computed(() => {
  const selectedCount = props.permissions.filter((p) => props.modelValue.includes(p._id)).length
  return selectedCount > 0 && selectedCount < props.permissions.length
})

// 切换全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    emit('update:modelValue', [])
  } else {
    emit(
      'update:modelValue',
      props.permissions.map((p) => p._id)
    )
  }
}

// 切换单个权限
function togglePermission(permissionId: string, checked: boolean) {
  const newValue = [...props.modelValue]
  if (checked) {
    if (!newValue.includes(permissionId)) {
      newValue.push(permissionId)
    }
  } else {
    const index = newValue.indexOf(permissionId)
    if (index > -1) {
      newValue.splice(index, 1)
    }
  }
  emit('update:modelValue', newValue)
}

// 清空选择
function clearSelection() {
  emit('update:modelValue', [])
}
</script>

<template>
  <div class="space-y-3">
    <!-- 操作栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Checkbox :checked="isAllSelected" :indeterminate="isIndeterminate" @update:checked="toggleSelectAll" />
        <span class="text-sm">{{ t('views.permission.select.selectAll') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground text-sm">
          {{ t('views.permission.select.selected', { count: props.modelValue.length }) }}
        </span>
        <Button v-if="props.modelValue.length > 0" variant="ghost" size="sm" @click="clearSelection">
          {{ t('views.permission.select.clearAll') }}
        </Button>
      </div>
    </div>

    <!-- 权限列表 -->
    <div v-if="props.loading" class="flex h-32 items-center justify-center">
      <span class="text-muted-foreground">{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="props.permissions.length === 0" class="flex h-32 items-center justify-center">
      <span class="text-muted-foreground">{{ t('views.permission.select.noData') }}</span>
    </div>

    <ScrollArea v-else class="h-64 rounded-md border">
      <div class="space-y-4 p-4">
        <div v-for="(perms, group) in groupedPermissions" :key="group" class="space-y-2">
          <h4 class="text-sm font-medium">{{ t(groupNames[group] || group) }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="permission in perms"
              :key="permission._id"
              class="flex items-center gap-2 rounded-md border p-2 hover:bg-accent cursor-pointer"
            >
              <Checkbox
                :checked="props.modelValue.includes(permission._id)"
                @update:checked="(checked: boolean) => togglePermission(permission._id, checked)"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate">{{ permission.name }}</p>
                <p class="text-muted-foreground text-xs truncate">{{ permission.code }}</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
