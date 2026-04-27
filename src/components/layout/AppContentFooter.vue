<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { SITE_BEIAN_URL, SITE_OWNER } from '@/definitions/constants/site.constants'

const { t } = useI18n()

const year = computed(() => new Date().getFullYear())

const beianIconSrc = computed(() => {
  const b = import.meta.env.BASE_URL
  const base = b.endsWith('/') ? b : `${b}/`
  return `${base}beian.png`
})

const beianHref = computed(() => {
  const u = SITE_BEIAN_URL
  return u && u.length > 0 ? u : null
})
</script>

<template>
  <footer
    class="border-border shrink-0 border-t bg-transparent px-4 py-3 text-center text-xs text-muted-foreground sm:px-6"
    role="contentinfo"
  >
    <div class="flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
      <p class="leading-relaxed">
        {{ t('layout.footer.copyright', { year, owner: SITE_OWNER }) }}
      </p>
      <p class="flex items-center justify-center gap-1.5 leading-relaxed">
        <img
          :src="beianIconSrc"
          alt=""
          width="20"
          height="20"
          class="h-4 w-auto shrink-0 select-none"
          decoding="async"
        />
        <a
          v-if="beianHref"
          :href="beianHref"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted-foreground hover:text-foreground underline-offset-2 transition-colors hover:underline"
          :aria-label="t('layout.footer.beianLinkAria')"
        >
          {{ t('layout.footer.beian') }}
        </a>
        <span v-else>{{ t('layout.footer.beian') }}</span>
      </p>
    </div>
  </footer>
</template>
