import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 浏览器标题文案键（不含站点后缀） */
    titleKey?: string
    /** 侧栏菜单项：路径 + 文案键 */
    sidebarNav?: Array<{ to: string; labelKey: string }>
    /** 为 true 时不展示左侧侧栏（如独立登录页） */
    hideSidebar?: boolean
  }
}
