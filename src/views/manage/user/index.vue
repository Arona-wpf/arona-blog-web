<script setup lang="ts">
import { type ColumnDef } from '@tanstack/vue-table'
import { computed, h, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { FormControl, FormField, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponseCodeEnum } from '@/definitions/enums/request.enums'
import { pr_v1_user_delete, pr_v1_user_list } from '@/fetch/user'
import type { UserListItem } from '@/fetch/user/types'
import { useUserStore } from '@/stores/user'

import UserDeleteDialog from './dialog/UserDeleteDialog.vue'
import UserFormDialog from './dialog/UserFormDialog.vue'

const { t } = useI18n()
const userStore = useUserStore()

const isAdministrator = computed(() => userStore.userInfo?.roles?.includes('administrator'))

// 状态
const loading = ref(false)
const users = ref<UserListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 角色选项（固定值）
const roleOptions = [
  { value: 'administrator', label: () => t('views.manage.user.roleAdministrator') },
  { value: 'user', label: () => t('views.manage.user.roleUser') }
]

// 搜索条件
const searchAccount = ref('')
const searchNickname = ref('')
const searchEmail = ref('')
const searchRoleId = ref('')

// 对话框状态
const formDialogOpen = ref(false)
const formDialogMode = ref<'create' | 'edit'>('create')
const editingUser = ref<UserListItem | null>(null)
const deleteDialogOpen = ref(false)
const deletingUser = ref<UserListItem | null>(null)

// 格式化时间
function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

// 格式化性别
function formatGender(gender: string) {
  if (gender === 'male') return t('views.manage.user.genderMale')
  if (gender === 'female') return t('views.manage.user.genderFemale')
  return t('views.manage.user.genderSecret')
}

// 格式化角色
function formatRoles(userRoles: string[]) {
  if (!userRoles || userRoles.length === 0) return t('views.manage.user.rolesNone')
  return userRoles
    .map((r) => {
      const option = roleOptions.find((opt) => opt.value === r)
      return option ? option.label() : r
    })
    .join(', ')
}

// 计算序号
function computeSeq(rowIndex: number): number {
  return (currentPage.value - 1) * pageSize.value + rowIndex + 1
}

// 表格列定义
const columns: ColumnDef<UserListItem>[] = [
  {
    accessorKey: 'seq',
    header: () => h('div', { class: 'w-12' }, t('views.manage.user.seq')),
    cell: ({ row }) => h('div', { class: 'w-12 text-center' }, computeSeq(row.index))
  },
  {
    accessorKey: 'account',
    header: () => t('views.manage.user.account'),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.account)
  },
  {
    accessorKey: 'nickname',
    header: () => t('views.manage.user.nickname'),
    cell: ({ row }) => row.original.nickname
  },
  {
    accessorKey: 'email',
    header: () => t('views.manage.user.email'),
    cell: ({ row }) => h('div', { class: 'text-muted-foreground' }, row.original.email)
  },
  {
    accessorKey: 'gender',
    header: () => t('views.manage.user.gender'),
    cell: ({ row }) => formatGender(row.original.gender)
  },
  {
    accessorKey: 'roles',
    header: () => t('views.manage.user.roles'),
    cell: ({ row }) => formatRoles(row.original.roles)
  },
  {
    accessorKey: 'created_at',
    header: () => t('views.manage.user.createdAt'),
    cell: ({ row }) => h('div', { class: 'text-muted-foreground text-sm' }, formatTime(row.original.created_at))
  },
  {
    id: 'actions',
    header: () => t('views.manage.user.actions'),
    cell: ({ row }) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: () => handleEdit(row.original)
          },
          () => t('views.manage.user.edit')
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'destructive',
            disabled: row.original.roles?.includes('administrator'),
            onClick: () => handleDelete(row.original)
          },
          () => t('views.manage.user.delete')
        )
      ])
  }
]

// 加载用户列表
async function loadUsers() {
  if (!isAdministrator.value) return

  loading.value = true
  try {
    const res = await pr_v1_user_list({
      current_page: currentPage.value,
      page_size: pageSize.value,
      account: searchAccount.value || undefined,
      nickname: searchNickname.value || undefined,
      email: searchEmail.value || undefined,
      role_id: searchRoleId.value || undefined
    })

    if (res.code === ResponseCodeEnum.SUCCESS && res.data) {
      users.value = res.data.list
      total.value = res.data.total
    }
  } catch {
    toast.error(t('views.manage.user.loadError'))
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  loadUsers()
}

// 重置搜索
function handleReset() {
  searchAccount.value = ''
  searchNickname.value = ''
  searchEmail.value = ''
  searchRoleId.value = ''
  currentPage.value = 1
  loadUsers()
}

// 新增用户
function handleCreate() {
  formDialogMode.value = 'create'
  editingUser.value = null
  formDialogOpen.value = true
}

// 编辑用户
function handleEdit(user: UserListItem) {
  formDialogMode.value = 'edit'
  editingUser.value = user
  formDialogOpen.value = true
}

// 删除用户
function handleDelete(user: UserListItem) {
  if (user.roles?.includes('administrator')) {
    toast.error(t('views.manage.user.cannotDeleteAdmin'))
    return
  }
  deletingUser.value = user
  deleteDialogOpen.value = true
}

// 分页变化
function handlePaginationChange({ currentPage: page, pageSize: size }: { currentPage: number; pageSize: number }) {
  currentPage.value = page
  pageSize.value = size
  loadUsers()
}

// 表单对话框成功
function handleFormSuccess() {
  loadUsers()
}

// 删除确认
async function handleDeleteConfirm() {
  if (!deletingUser.value) return

  try {
    const res = await pr_v1_user_delete({ _id: deletingUser.value._id })
    if (res.code === ResponseCodeEnum.SUCCESS) {
      toast.success(t('views.manage.user.deleteSuccess'))
      deleteDialogOpen.value = false
      deletingUser.value = null
      loadUsers()
    }
  } catch {
    // 错误已由请求拦截器处理
  }
}

onMounted(() => {
  if (isAdministrator.value) {
    loadUsers()
  }
})

// 监听用户信息变化，当成为管理员时自动加载数据
watch(isAdministrator, (isAdmin) => {
  if (isAdmin && users.value.length === 0) {
    loadUsers()
  }
})
</script>

<template>
  <div class="space-y-6 px-2 sm:px-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('views.manage.user.title') }}</h1>
        <p class="text-muted-foreground text-sm">{{ t('views.manage.user.subtitle') }}</p>
      </div>
      <Button v-if="isAdministrator" class="gap-2 shrink-0" @click="handleCreate">
        {{ t('views.manage.user.create') }}
      </Button>
    </div>

    <div v-if="!isAdministrator" class="flex min-h-[12rem] items-center justify-center">
      <p class="text-muted-foreground">{{ t('views.manage.user.noPermission') }}</p>
    </div>

    <template v-else>
      <!-- 搜索区域 -->
      <div class="border-border/60 rounded-xl border p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <FormField name="search_account">
            <FormLabel>{{ t('views.manage.user.account') }}</FormLabel>
            <FormControl>
              <Input
                v-model="searchAccount"
                :placeholder="t('views.manage.user.accountPlaceholder')"
                @keyup.enter="handleSearch"
              />
            </FormControl>
          </FormField>

          <FormField name="search_nickname">
            <FormLabel>{{ t('views.manage.user.nickname') }}</FormLabel>
            <FormControl>
              <Input
                v-model="searchNickname"
                :placeholder="t('views.manage.user.nicknamePlaceholder')"
                @keyup.enter="handleSearch"
              />
            </FormControl>
          </FormField>

          <FormField name="search_email">
            <FormLabel>{{ t('views.manage.user.email') }}</FormLabel>
            <FormControl>
              <Input
                v-model="searchEmail"
                :placeholder="t('views.manage.user.emailPlaceholder')"
                @keyup.enter="handleSearch"
              />
            </FormControl>
          </FormField>

          <FormField name="search_role">
            <FormLabel>{{ t('views.manage.user.roles') }}</FormLabel>
            <Select v-model="searchRoleId">
              <SelectTrigger>
                <SelectValue :placeholder="t('views.manage.user.rolesPlaceholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="role in roleOptions" :key="role.value" :value="role.value">
                  {{ role.label() }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div class="flex items-center gap-2 self-end pb-1">
            <Button @click="handleSearch">{{ t('views.manage.user.search') }}</Button>
            <Button variant="outline" @click="handleReset">
              {{ t('views.manage.user.reset') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <DataTable
        :columns="columns"
        :data="users"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :show-pagination="true"
        :show-reload="true"
        @pagination-change="handlePaginationChange"
        @reload="loadUsers"
      />
    </template>

    <!-- 新增/编辑对话框 -->
    <UserFormDialog
      v-model:open="formDialogOpen"
      :mode="formDialogMode"
      :user="editingUser"
      @success="handleFormSuccess"
    />

    <!-- 删除确认对话框 -->
    <UserDeleteDialog v-model:open="deleteDialogOpen" :user="deletingUser" @confirm="handleDeleteConfirm" />
  </div>
</template>
