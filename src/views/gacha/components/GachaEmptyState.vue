<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Empty from '@/components/ui/empty/Empty.vue'

const props = defineProps<{
  /** 是否已选择账号 */
  hasSelectedAccount: boolean
  /** 未选择时的提示 key */
  emptyNotSelectedKey: string
  /** 有账号但无数据时的提示 key */
  emptyNoRecordsKey: string
}>()

const { t } = useI18n()

const message = props.hasSelectedAccount ? props.emptyNoRecordsKey : props.emptyNotSelectedKey
</script>

<template>
  <Empty :title="t(message)" />
</template>
