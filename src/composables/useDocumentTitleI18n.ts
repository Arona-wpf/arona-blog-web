import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

function resolveTitleKeyFromMatched(matched: { meta: Record<string, unknown> }[]) {
  const record = [...matched].reverse().find((r) => typeof r.meta.titleKey === 'string')
  return record?.meta.titleKey as string | undefined
}

/** 按路由 meta.titleKey 与当前语言同步 document.title */
export function useDocumentTitleI18n() {
  const route = useRoute()
  const { t, locale } = useI18n()

  watch(
    () => [route.path, locale.value] as const,
    () => {
      const titleKey = resolveTitleKeyFromMatched(route.matched)
      document.title = titleKey ? `${t(titleKey)} · ${t('layout.siteName')}` : t('layout.siteName')
    },
    { immediate: true }
  )
}
