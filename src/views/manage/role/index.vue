<script setup lang="ts">
import { type ColumnDef } from '@tanstack/vue-table'
import { computed, h, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { FormControl, FormField, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_role_list } from '@/fetch/role'
import type { RoleListItem } from '@/fetch/role/types'
import { useUserStore } from '@/stores/user'

import RoleFormDialog from './dialog/RoleFormDialog.vue'

const { t } = useI18n()
const userStore = useUserStore()

const isAdministrator = computed(() => userStore.userInfo?.roles?.includes('administrator'))

// 状态
const loading = ref(false)
const roles = ref<RoleListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索条件
const searchCode = ref('')

// 对话框状态
const formDialogOpen = ref(false)
const editingRole = ref<RoleListItem | null>(null)

// 格式化时间
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

// 计算序号
function computeSeq(rowIndex: number): number {
  return (currentPage.value - 1) * pageSize.value + rowIndex + 1
}

// 格式化权限数量
function formatPermissionCount(role: RoleListItem, permissionType: 'api' | 'menu') {
  if (role.code === 'administrator') {
    return t('views.manage.role.permissionAll')
  }
  const count = permissionType === 'api' ? (role.api_permissions?.length ?? 0) : (role.menu_permissions?.length ?? 0)
  return t('views.manage.role.permissionCount', { count })
}

// 表格列定义
const columns: ColumnDef<RoleListItem>[] = [
  {
    accessorKey: 'seq',
    header: () => h('div', { class: 'w-12' }, t('views.manage.role.seq')),
    cell: ({ row }) => h('div', { class: 'w-12 text-center' }, computeSeq(row.index))
  },
  {
    accessorKey: 'name',
    header: () => t('views.manage.role.name'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name)
  },
  {
    accessorKey: 'code',
    header: () => t('views.manage.role.code'),
    cell: ({ row }) => h('div', { class: 'text-muted-foreground' }, row.original.code)
  },
  {
    accessorKey: 'api_permissions',
    header: () => t('views.manage.role.apiPermissions'),
    cell: ({ row }) => formatPermissionCount(row.original, 'api')
  },
  {
    accessorKey: 'menu_permissions',
    header: () => t('views.manage.role.menuPermissions'),
    cell: ({ row }) => formatPermissionCount(row.original, 'menu')
  },
  {
    accessorKey: 'created_at',
    header: () => t('views.manage.role.createdAt'),
    cell: ({ row }) => h('div', { class: 'text-muted-foreground text-sm' }, formatTime(row.original.created_at))
  },
  {
    id: 'actions',
    header: () => t('views.manage.role.actions'),
    cell: ({ row }) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: () => handleEdit(row.original)
          },
          () => t('views.manage.role.edit')
        )
      ])
  }
]

// 加载角色列表
async function loadRoles() {
  if (!isAdministrator.value) return

  loading.value = true
  try {
    const res = await pr_v1_role_list({
      current_page: currentPage.value,
      page_size: pageSize.value,
      code: searchCode.value || undefined
    })

    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      roles.value = res.data.list
      total.value = res.data.total
    }
  } catch {
    toast.error(t('views.manage.role.loadError'))
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  loadRoles()
}

// 重置搜索
function handleReset() {
  searchCode.value = ''
  currentPage.value = 1
  loadRoles()
}

// 编辑角色
function handleEdit(role: RoleListItem) {
  editingRole.value = role
  formDialogOpen.value = true
}

// 分页变化
function handlePaginationChange({ currentPage: page, pageSize: size }: { currentPage: number; pageSize: number }) {
  currentPage.value = page
  pageSize.value = size
  loadRoles()
}

// 表单对话框成功
function handleFormSuccess() {
  loadRoles()
}

onMounted(() => {
  if (isAdministrator.value) {
    loadRoles()
  }
})

// 监听用户信息变化，当成为管理员时自动加载数据
watch(isAdministrator, (isAdmin) => {
  if (isAdmin && roles.value.length === 0) {
    loadRoles()
  }
})
</script>

<template>
  <div class="space-y-6 px-2 sm:px-4">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.manage.role.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.manage.role.subtitle') }}</p>
    </div>

    <div v-if="!isAdministrator" class="flex min-h-[12rem] items-center justify-center">
      <p class="text-muted-foreground">{{ t('views.manage.role.noPermission') }}</p>
    </div>

    <template v-else>
      <!-- 搜索区域 -->
      <div class="border-border/60 rounded-xl border p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField name="search_code">
            <FormLabel>{{ t('views.manage.role.code') }}</FormLabel>
            <FormControl>
              <Input
                v-model="searchCode"
                :placeholder="t('views.manage.role.codePlaceholder')"
                @keyup.enter="handleSearch"
              />
            </FormControl>
          </FormField>

          <div class="flex items-center gap-2 self-end pb-1">
            <Button @click="handleSearch">{{ t('views.manage.role.search') }}</Button>
            <Button variant="outline" @click="handleReset">
              {{ t('views.manage.role.reset') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <DataTable
        :columns="columns"
        :data="roles"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :show-pagination="true"
        :show-reload="true"
        @pagination-change="handlePaginationChange"
        @reload="loadRoles"
      />
    </template>

    <!-- 编辑对话框 -->
    <RoleFormDialog v-model:open="formDialogOpen" mode="edit" :role="editingRole" @success="handleFormSuccess" />
  </div>
</template>
