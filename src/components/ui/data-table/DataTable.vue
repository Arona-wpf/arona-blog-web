<script setup lang="ts" generic="TData, TValue">
import {
  type ColumnDef,
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type Row,
  type RowSelectionState,
  useVueTable
} from '@tanstack/vue-table'
import { RefreshCwIcon } from 'lucide-vue-next'
import { computed, type HTMLAttributes, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { Pagination } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Props {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  selectedRows?: TData[]
  class?: HTMLAttributes['class']
  enableRowSelection?: boolean
  currentPage?: number
  pageSize?: number
  pageSizeOptions?: number[]
  showPagination?: boolean
  showReload?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  enableRowSelection: false,
  currentPage: 1,
  pageSize: 10,
  pageSizeOptions: () => [10, 20, 50, 100],
  showReload: true,
  showPagination: true
})

const emit = defineEmits<{
  (e: 'update:currentPage', payload: number): void
  (e: 'update:pageSize', payload: number): void
  (e: 'page-change', payload: number): void
  (e: 'page-size-change', payload: number): void
  (e: 'pagination-change', payload: { currentPage: number; pageSize: number }): void
  (e: 'reload'): void
  (e: 'update:selectedRows', payload: TData[]): void
  (e: 'row-selection-change', payload: { currentRow: TData | null; selectedRows: TData[] }): void
}>()

const { t, te } = useI18n()

const pageIndex = ref(Math.max(0, props.currentPage - 1))
const pageSizeState = ref(props.pageSize)
const rowSelection = ref<RowSelectionState>({})

watch(
  () => props.currentPage,
  (nextPage) => {
    const nextPageIndex = Math.max(0, nextPage - 1)
    if (nextPageIndex !== pageIndex.value) {
      table.setPageIndex(nextPageIndex)
    }
  }
)

watch(
  () => props.pageSize,
  (nextPageSize) => {
    if (nextPageSize !== pageSizeState.value) {
      table.setPageSize(nextPageSize)
    }
  }
)

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  enableRowSelection: () => props.enableRowSelection,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get pagination() {
      return {
        pageIndex: pageIndex.value,
        pageSize: pageSizeState.value
      }
    },
    get rowSelection() {
      return rowSelection.value
    }
  },
  onPaginationChange: (updaterOrValue) => {
    const current = {
      pageIndex: pageIndex.value,
      pageSize: pageSizeState.value
    }
    const next = typeof updaterOrValue === 'function' ? updaterOrValue(current) : updaterOrValue

    const pageChanged = next.pageIndex !== pageIndex.value
    const sizeChanged = next.pageSize !== pageSizeState.value

    pageIndex.value = next.pageIndex
    pageSizeState.value = next.pageSize

    if (pageChanged) {
      const page = next.pageIndex + 1
      emit('update:currentPage', page)
      emit('page-change', page)
    }

    if (sizeChanged) {
      emit('update:pageSize', next.pageSize)
      emit('page-size-change', next.pageSize)
    }

    if (pageChanged || sizeChanged) {
      emit('pagination-change', {
        currentPage: next.pageIndex + 1,
        pageSize: next.pageSize
      })
    }
  },
  onRowSelectionChange: (updaterOrValue) => {
    const current = rowSelection.value
    const next = typeof updaterOrValue === 'function' ? updaterOrValue(current) : updaterOrValue

    const currentKeys = new Set(Object.keys(current).filter((key) => current[key]))
    const nextKeys = new Set(Object.keys(next).filter((key) => next[key]))

    let changedRowId: string | null = null
    for (const key of nextKeys) {
      if (!currentKeys.has(key)) {
        changedRowId = key
        break
      }
    }
    if (!changedRowId) {
      for (const key of currentKeys) {
        if (!nextKeys.has(key)) {
          changedRowId = key
          break
        }
      }
    }

    rowSelection.value = next
    emitRowSelectionChange(changedRowId)
  }
})

watch(
  () => props.enableRowSelection,
  (enabled) => {
    if (!enabled && Object.keys(rowSelection.value).length > 0) {
      rowSelection.value = {}
      emitRowSelectionChange(null)
    }
  }
)

watch(
  [() => props.selectedRows, () => props.data, () => props.enableRowSelection],
  ([selectedRows, , enabled]) => {
    if (!enabled || !selectedRows) {
      return
    }

    const nextSelection = buildRowSelectionState(selectedRows)
    if (!isSameRowSelectionState(rowSelection.value, nextSelection)) {
      rowSelection.value = nextSelection
    }
  },
  { immediate: true }
)

const currentPageValue = computed(() => pageIndex.value + 1)
const totalPages = computed(() => Math.max(1, table.getPageCount()))
const pageSizeValue = computed(() => String(pageSizeState.value))
const pageSizeOptions = computed(() =>
  props.pageSizeOptions.filter((size, index, all) => Number.isInteger(size) && size > 0 && all.indexOf(size) === index)
)
const emptyTitle = computed(() => {
  if (props.emptyTitle) {
    return props.emptyTitle
  }

  return te('components.dataTable.empty.title') ? t('components.dataTable.empty.title') : 'No data'
})
const emptyDescription = computed(() => {
  if (props.emptyDescription) {
    return props.emptyDescription
  }

  return te('components.dataTable.empty.description')
    ? t('components.dataTable.empty.description')
    : 'There is no content to display right now.'
})

function handlePageChange(page: number) {
  table.setPageIndex(page - 1)
}

function handlePageSizeChange(value: unknown) {
  if (value === null || value === undefined) {
    return
  }
  const nextPageSize = Number(value)
  if (!Number.isInteger(nextPageSize) || nextPageSize <= 0) {
    return
  }

  table.setPageSize(nextPageSize)
  table.setPageIndex(0)
}

function handleReload() {
  emit('reload')
}

function emitRowSelectionChange(changedRowId: string | null) {
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
  const currentRow = changedRowId ? (table.getCoreRowModel().rowsById[changedRowId]?.original ?? null) : null

  emit('update:selectedRows', selectedRows)
  emit('row-selection-change', {
    currentRow,
    selectedRows
  })
}

function handleRowClick(row: Row<TData>) {
  if (!props.enableRowSelection) {
    return
  }
  row.toggleSelected()
}

function buildRowSelectionState(selectedRows: TData[]): RowSelectionState {
  const selectedSet = new Set(selectedRows)
  const nextState: RowSelectionState = {}

  for (const row of table.getCoreRowModel().rows) {
    if (selectedSet.has(row.original)) {
      nextState[row.id] = true
    }
  }

  return nextState
}

function isSameRowSelectionState(a: RowSelectionState, b: RowSelectionState): boolean {
  const aKeys = Object.keys(a)
    .filter((key) => a[key])
    .sort()
  const bKeys = Object.keys(b)
    .filter((key) => b[key])
    .sort()

  if (aKeys.length !== bKeys.length) {
    return false
  }

  return aKeys.every((key, index) => key === bKeys[index])
}
</script>

<template>
  <div data-slot="data-table" :class="cn('w-full', props.class)">
    <div v-if="props.showReload" class="mb-3 flex justify-end">
      <Button
        variant="outline"
        size="icon-sm"
        :aria-label="te('components.dataTable.reload') ? t('components.dataTable.reload') : 'Reload'"
        @click="handleReload"
      >
        <RefreshCwIcon class="size-4" />
      </Button>
    </div>

    <div :class="cn('relative', props.showPagination && 'pb-16')">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id" :colspan="header.colSpan">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              :class="cn(props.enableRowSelection && 'cursor-pointer')"
              @click="handleRowClick(row)"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="Math.max(1, props.columns.length)" class="p-0">
                <Empty :title="emptyTitle" :description="emptyDescription" />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>

      <div v-if="props.showPagination" class="absolute right-0 bottom-0">
        <div class="bg-background flex items-center gap-2 rounded-md border px-2 py-1 shadow-xs">
          <span class="text-muted-foreground text-xs">
            {{
              te('components.dataTable.pagination.pageSize') ? t('components.dataTable.pagination.pageSize') : 'Rows'
            }}
          </span>
          <Select :model-value="pageSizeValue" @update:model-value="handlePageSizeChange">
            <SelectTrigger class="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="size in pageSizeOptions" :key="size" :value="String(size)">
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Pagination
            :current-page="currentPageValue"
            :total-pages="totalPages"
            :on-page-change="handlePageChange"
            class="justify-end"
          />
        </div>
      </div>
    </div>
  </div>
</template>
