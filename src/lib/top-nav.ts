import {
  Clock,
  FileText,
  FolderTree,
  Globe,
  Hash,
  Info,
  KeyRound,
  LayoutDashboard,
  Link2,
  ListTodo,
  Lock,
  MoreHorizontal,
  Newspaper,
  Timer
} from 'lucide-vue-next'
import type { Component } from 'vue'

export interface TopNavSubItem {
  to: string
  labelKey: string
  icon: Component
}

export interface TopNavModule {
  id: string
  labelKey: string
  prefix: string
  items: TopNavSubItem[]
}

export const topNavModules: TopNavModule[] = [
  {
    id: 'dev',
    labelKey: 'layout.nav.modules.dev',
    prefix: '/dev',
    items: [
      { to: '/dev/overview', labelKey: 'layout.nav.sub.devOverview', icon: LayoutDashboard },
      { to: '/dev/tasks', labelKey: 'layout.nav.sub.devTasks', icon: ListTodo }
    ]
  },
  {
    id: 'crypto',
    labelKey: 'layout.nav.modules.crypto',
    prefix: '/crypto',
    items: [
      { to: '/crypto/hash', labelKey: 'layout.nav.sub.cryptoHash', icon: Hash },
      { to: '/crypto/symmetric', labelKey: 'layout.nav.sub.cryptoSymmetric', icon: KeyRound }
    ]
  },
  {
    id: 'time',
    labelKey: 'layout.nav.modules.time',
    prefix: '/time',
    items: [
      { to: '/time/world', labelKey: 'layout.nav.sub.timeWorld', icon: Globe },
      { to: '/time/timestamp', labelKey: 'layout.nav.sub.timeTimestamp', icon: Timer }
    ]
  },
  {
    id: 'text',
    labelKey: 'layout.nav.modules.text',
    prefix: '/text',
    items: [
      { to: '/text/articles', labelKey: 'layout.nav.sub.textArticles', icon: Newspaper },
      { to: '/text/categories', labelKey: 'layout.nav.sub.textCategories', icon: FolderTree }
    ]
  },
  {
    id: 'other',
    labelKey: 'layout.nav.modules.other',
    prefix: '/other',
    items: [
      { to: '/other/links', labelKey: 'layout.nav.sub.otherLinks', icon: Link2 },
      { to: '/other/about', labelKey: 'layout.nav.sub.otherAbout', icon: Info }
    ]
  }
]

export const topNavModuleIcons: Record<string, Component> = {
  dev: LayoutDashboard,
  crypto: Lock,
  time: Clock,
  text: FileText,
  other: MoreHorizontal
}
