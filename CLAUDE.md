# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**arona-blog-web** — 网站前端 Web 服务，基于 **Vue 3** + **TypeScript** + **Vite 8**，使用 **Pinia** 状态管理、**Vue Router 5** 路由、**Vue I18n** 国际化、**Tailwind CSS 4** 样式、**shadcn-vue** UI 组件库（reka-ui）。

## 开发命令

```sh
# 安装依赖
yarn install

# 开发模式（热重载）
yarn dev

# 类型检查
yarn type-check

# 代码规范检查
yarn lint
yarn lint:oxlint

# 代码格式化
yarn format

# 生产构建
yarn build

# 构建预览
yarn preview

# 启动生产服务器
yarn start
```

**Node.js 要求：** >= 24.0.0（Volta 锁定 24.14.0）

## 架构设计

### 目录结构（src/）

```
main.ts                   — 应用入口，创建 Vue 实例并挂载插件
App.vue                   — 根组件
style.css                 — 全局样式（Tailwind 入口）
assets/                   — 静态资源（图片等）
components/ui/            — UI 组件库（shadcn-vue 风格，基于 reka-ui）
layouts/                  — 布局组件（AppLayout、SectionOutlet、Header、Footer）
views/                    — 页面视图，按功能模块分目录（crypto、time、text、other、user、workspace）
plugins/                  — Vue 插件注册（router、store、i18n）
stores/                   — Pinia 状态管理（user.ts）
composables/              — Vue 组合式函数（useAppColorMode、useDocumentTitleI18n 等）
lib/                      — 工具函数与库封装（request、nprogress、utils、top-nav）
fetch/                    — API 请求封装（Get、Post、Put、Delete）
definitions/              — 常量、枚举、类型定义
  constants/              — 运行时常量
  enums/                  — 枚举定义
  types/                  — TypeScript 类型定义
locale/                   — 国际化词条（zh_cn/、en_us/）
types/                    — 全局类型声明（如 vue-router.d.ts）
```

### 路由结构

- 使用 `createWebHistory` 模式
- 主布局 `AppLayout` 包含 Header + Sidebar + RouterView
- `SectionOutlet` 用于嵌套子路由，支持 `meta.sidebarNav` 配置侧边导航
- 路由 `meta` 支持字段：
  - `titleKey` — 页面标题 i18n key
  - `sidebarNav` — 侧边导航配置（`{ to, labelKey }` 数组）
  - `hideSidebar` — 是否隐藏侧边栏（如登录页）

### 请求封装

- 基于 Axios 封装，提供 `Get`、`Post`、`Put`、`Delete` 方法
- 请求缓存机制：使用 `sm3` 哈希作为缓存 key，避免重复请求
- 请求间隔控制：防止短时间内相同 URL 多次请求
- 响应拦截：自动处理 `redirect` 重定向、错误 toast 提示
- 响应格式：`{ code, msg, data, redirect }`，`code: 0` 表示成功

### 国际化

- 使用 `vue-i18n`，支持 `zh-CN` / `en-US`
- 词条按模块分文件：`global.json`、`layout.json`、`views.*.json`
- i18n key 使用点分层级（如 `layout.nav.modules.dev`）
- 每个 key 必须同时存在中英文
- 存储 key：`arona-locale`

### 状态管理

- 使用 Pinia Composition API 风格（`defineStore` + `ref`）
- `useUserStore` — 用户登录状态、用户信息管理

### UI 组件

- 基于 `reka-ui`（无样式 Vue 组件库）+ Tailwind CSS
- 组件风格参考 shadcn-vue，位于 `components/ui/`
- 主要组件：`Button`、`Input`、`Sheet`、`Sidebar`、`DropdownMenu`、`Avatar`、`Form`、`Tooltip` 等

## 核心编码约定

### 文件命名

- Vue 组件：`PascalCase.vue`（如 `AppLayout.vue`）
- TypeScript 文件：`camelCase.ts`（如 `useAppColorMode.ts`）
- 常量文件：`*.constants.ts`
- 枚举文件：`*.enum.ts`
- 类型文件：`*.types.ts`

### 组件结构

- 使用 `<script setup lang="ts">` 语法
- 导入顺序：Node 内置 → 第三方 → `@/` 别名 → 相对路径
- Props 使用 `defineProps` + TypeScript 泛型
- 组件内逻辑优先使用 `composables` 复用

### 样式规范

- 使用 Tailwind CSS 4，支持 `@apply`、CSS 变量
- 颜色主题：`--background`、`--foreground`、`--primary`、`--muted` 等
- 暗色模式：通过 `useAppColorMode` 控制，CSS 变量自动切换

### 导入别名

- `@/` — `src/` 目录别名（由 vite/tsconfig 配置）

### 国际化 key 规范

- 必须使用 i18n key，禁止硬编码文案
- key 格式：`模块.子模块.字段`（如 `views.crypto.hash.title`）

### 枚举规范

- 使用 TypeScript `enum`，命名 `PascalCase` + `Enum` 后缀（如 `ResponseCodeEnum`）
- 枚举值使用 `UPPER_SNAKE_CASE`

## 代码风格

- 全部使用 TypeScript，2 空格缩进，LF 换行符，UTF-8 编码
- 命名：组件 `PascalCase`，方法/变量 `camelCase`，常量 `UPPER_SNAKE_CASE`
- 格式以 ESLint + Prettier 为准，使用 oxlint 快速检查
- 导入排序：eslint-plugin-simple-import-sort