import { useDark } from '@vueuse/core'
import { type Ref, watch } from 'vue'

const storageKey = 'arona-color-mode'

const TRANSITION_MS = 480

let sharedIsDark: Ref<boolean> | null = null
let transitionWatchRegistered = false

function runThemeTransition() {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  el.classList.add('theme-transition')
  window.setTimeout(() => el.classList.remove('theme-transition'), TRANSITION_MS)
}

/** 在 html 根节点上切换 `dark` class，并写入 localStorage；切换时带颜色过渡 */
export function useAppColorMode() {
  if (!sharedIsDark) {
    sharedIsDark = useDark({
      selector: 'html',
      attribute: 'class',
      storageKey,
      valueDark: 'dark',
      valueLight: ''
    }) as Ref<boolean>
    if (typeof document !== 'undefined' && !transitionWatchRegistered) {
      transitionWatchRegistered = true
      watch(sharedIsDark, () => {
        runThemeTransition()
      })
    }
  }
  return sharedIsDark
}
