<script setup lang="ts">
import { type ColumnDef } from '@tanstack/vue-table'
import { computed, h, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { FormField, FormLabel } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_permission_list } from '@/fetch/permission'
import type { PermissionListItem } from '@/fetch/permission/types'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

const isAdministrator = computed(() => userStore.userInfo?.roles?.includes('administrator'))

// 状态
const loading = ref(false)
const permissions = ref<PermissionListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索条件
const searchGroup = ref('')
const searchType = ref('')
const searchAction = ref('')

// 格式化时间
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

// 计算序号
function computeSeq(rowIndex: number): number {
  return (currentPage.value - 1) * pageSize.value + rowIndex + 1
}

// 格式化权限组
function formatGroup(group: string) {
  const map: Record<string, string> = {
    user: t('views.manage.permission.groupUser'),
    role: t('views.manage.permission.groupRole'),
    permission: t('views.manage.permission.groupPermission'),
    log: t('views.manage.permission.groupLog')
  }
  return map[group] || group
}

// 格式化权限类型
function formatType(type: string) {
  return type === 'api' ? t('views.manage.permission.typeApi') : t('views.manage.permission.typeMenu')
}

// 格式化权限动作
function formatAction(action: string) {
  const map: Record<string, string> = {
    create: t('views.manage.permission.actionCreate'),
    delete: t('views.manage.permission.actionDelete'),
    update: t('views.manage.permission.actionUpdate'),
    view: t('views.manage.permission.actionView')
  }
  return map[action] || action
}

// 表格列定义
const columns: ColumnDef<PermissionListItem>[] = [
  {
    accessorKey: 'seq',
    header: () => h('div', { class: 'w-12' }, t('views.manage.permission.seq')),
    cell: ({ row }) => h('div', { class: 'w-12 text-center' }, computeSeq(row.index))
  },
  {
    accessorKey: 'name',
    header: () => t('views.manage.permission.name'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name)
  },
  {
    accessorKey: 'group',
    header: () => t('views.manage.permission.group'),
    cell: ({ row }) => formatGroup(row.original.group)
  },
  {
    accessorKey: 'type',
    header: () => t('views.manage.permission.type'),
    cell: ({ row }) => formatType(row.original.type)
  },
  {
    accessorKey: 'code',
    header: () => t('views.manage.permission.code'),
    cell: ({ row }) => h('div', { class: 'text-muted-foreground' }, row.original.code)
  },
  {
    accessorKey: 'action',
    header: () => t('views.manage.permission.action'),
    cell: ({ row }) => formatAction(row.original.action)
  },
  {
    accessorKey: 'created_at',
    header: () => t('views.manage.permission.createdAt'),
    cell: ({ row }) => h('div', { class: 'text-muted-foreground text-sm' }, formatTime(row.original.created_at))
  }
]

// 加载权限列表
async function loadPermissions() {
  if (!isAdministrator.value) return

  loading.value = true
  try {
    const res = await pr_v1_permission_list({
      current_page: currentPage.value,
      page_size: pageSize.value,
      group: searchGroup.value || undefined,
      type: searchType.value || undefined,
      action: searchAction.value || undefined
    })

    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      permissions.value = res.data.list
      total.value = res.data.total
    }
  } catch {
    toast.error(t('views.manage.permission.loadError'))
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  loadPermissions()
}

// 重置搜索
function handleReset() {
  searchGroup.value = ''
  searchType.value = ''
  searchAction.value = ''
  currentPage.value = 1
  loadPermissions()
}

// 分页变化
function handlePaginationChange({ currentPage: page, pageSize: size }: { currentPage: number; pageSize: number }) {
  currentPage.value = page
  pageSize.value = size
  loadPermissions()
}

onMounted(() => {
  if (isAdministrator.value) {
    loadPermissions()
  }
})

// 监听用户信息变化，当成为管理员时自动加载数据
watch(isAdministrator, (isAdmin) => {
  if (isAdmin && permissions.value.length === 0) {
    loadPermissions()
  }
})
</script>

<template>
  <div class="space-y-6 px-2 sm:px-4">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.manage.permission.title') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('views.manage.permission.subtitle') }}</p>
    </div>

    <div v-if="!isAdministrator" class="flex min-h-[12rem] items-center justify-center">
      <p class="text-muted-foreground">{{ t('views.manage.permission.noPermission') }}</p>
    </div>

    <template v-else>
      <!-- 搜索区域 -->
      <div class="border-border/60 rounded-xl border p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField name="search_group">
            <FormLabel>{{ t('views.manage.permission.group') }}</FormLabel>
            <Select v-model="searchGroup">
              <SelectTrigger>
                <SelectValue :placeholder="t('views.manage.permission.groupPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{{ t('views.manage.permission.groupUser') }}</SelectItem>
                <SelectItem value="role">{{ t('views.manage.permission.groupRole') }}</SelectItem>
                <SelectItem value="permission">{{ t('views.manage.permission.groupPermission') }}</SelectItem>
                <SelectItem value="log">{{ t('views.manage.permission.groupLog') }}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="search_type">
            <FormLabel>{{ t('views.manage.permission.type') }}</FormLabel>
            <Select v-model="searchType">
              <SelectTrigger>
                <SelectValue :placeholder="t('views.manage.permission.typePlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">{{ t('views.manage.permission.typeApi') }}</SelectItem>
                <SelectItem value="menu">{{ t('views.manage.permission.typeMenu') }}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="search_action">
            <FormLabel>{{ t('views.manage.permission.action') }}</FormLabel>
            <Select v-model="searchAction">
              <SelectTrigger>
                <SelectValue :placeholder="t('views.manage.permission.actionPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">{{ t('views.manage.permission.actionCreate') }}</SelectItem>
                <SelectItem value="delete">{{ t('views.manage.permission.actionDelete') }}</SelectItem>
                <SelectItem value="update">{{ t('views.manage.permission.actionUpdate') }}</SelectItem>
                <SelectItem value="view">{{ t('views.manage.permission.actionView') }}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div class="flex items-center gap-2 self-end pb-1">
            <Button @click="handleSearch">{{ t('views.manage.permission.search') }}</Button>
            <Button variant="outline" @click="handleReset">
              {{ t('views.manage.permission.reset') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <DataTable
        :columns="columns"
        :data="permissions"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :show-pagination="true"
        :show-reload="true"
        @pagination-change="handlePaginationChange"
        @reload="loadPermissions"
      />
    </template>
  </div>
</template>
