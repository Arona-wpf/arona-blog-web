# arona-blog-web

🌍 English | [中文](./README.zh-CN.md)

Frontend web service for Arona's personal blog. Features are still being developed gradually...

## Project Architecture

| Component | Version |
|-----------|---------|
| Framework | Vue 3 |
| Language | TypeScript 5.9.3 |
| Build Tool | Vite 8 |
| State Management | Pinia |
| Router | Vue Router 5 |
| i18n | Vue I18n |
| Styling | Tailwind CSS 4 |
| UI Library | shadcn-vue (reka-ui) |

## Development Commands

```sh
# Install dependencies
yarn install

# Development mode (hot reload)
yarn dev

# Type check
yarn type-check

# Lint
yarn lint
yarn lint:oxlint

# Format
yarn format

# Production build
yarn build

# Build preview
yarn preview

# Start production server
yarn start
```

**Node.js Requirement:** >= 24.0.0 (Volta locked at 24.14.0)

## Architecture Design

### Directory Structure (src/)

```
main.ts                   — Application entry, creates Vue instance and mounts plugins
App.vue                   — Root component
style.css                 — Global styles (Tailwind entry)
assets/                   — Static resources (images, etc.)
components/ui/            — UI component library (shadcn-vue style, based on reka-ui)
layouts/                  — Layout components (AppLayout, SectionOutlet, Header, Footer)
views/                    — Page views, organized by feature modules (crypto, time, text, other, user, workspace)
plugins/                  — Vue plugin registration (router, store, i18n)
stores/                   — Pinia state management (user.ts)
composables/              — Vue composition functions (useAppColorMode, useDocumentTitleI18n, etc.)
lib/                      — Utility functions and library wrappers (request, nprogress, utils, top-nav)
fetch/                    — API request wrappers (Get, Post, Put, Delete)
definitions/              — Constants, enums, type definitions
  constants/              — Runtime constants
  enums/                  — Enum definitions
  types/                  — TypeScript type definitions
locale/                   — i18n translations (zh_cn/, en_us/)
types/                    — Global type declarations (e.g., vue-router.d.ts)
```

### Routing Structure

- Uses `createWebHistory` mode
- Main layout `AppLayout` contains Header + Sidebar + RouterView
- `SectionOutlet` for nested child routes, supports `meta.sidebarNav` for sidebar navigation config
- Route `meta` supports fields:
  - `titleKey` — Page title i18n key
  - `sidebarNav` — Sidebar navigation config (`{ to, labelKey }` array)
  - `hideSidebar` — Whether to hide sidebar (e.g., login page)

### Request Wrapper

- Based on Axios wrapper, provides `Get`, `Post`, `Put`, `Delete` methods
- Request caching: uses `sm3` hash as cache key, avoids duplicate requests
- Request interval control: prevents multiple requests to same URL in short time
- Response interceptor: auto handles `redirect` redirects, error toast notifications
- Response format: `{ code, msg, data, redirect }`, `code: 0` means success

### Internationalization

- Uses `vue-i18n`, supports `zh-CN` / `en-US`
- Translation files organized by modules: `global.json`, `layout.json`, `views.*.json`
- i18n key uses dot hierarchy (e.g., `layout.nav.modules.dev`)
- Each key must exist in both Chinese and English
- Storage key: `arona-locale`

### State Management

- Uses Pinia Composition API style (`defineStore` + `ref`)
- `useUserStore` — User login state, user info management

### UI Components

- Based on `reka-ui` (unstyled Vue component library) + Tailwind CSS
- Component style follows shadcn-vue, located in `components/ui/`
- Main components: `Button`, `Input`, `Sheet`, `Sidebar`, `DropdownMenu`, `Avatar`, `Form`, `Tooltip`, etc.

## Core Coding Conventions

### File Naming

- Vue components: `PascalCase.vue` (e.g., `AppLayout.vue`)
- TypeScript files: `camelCase.ts` (e.g., `useAppColorMode.ts`)
- Constant files: `*.constants.ts`
- Enum files: `*.enum.ts`
- Type files: `*.types.ts`

### Component Structure

- Uses `<script setup lang="ts">` syntax
- Import order: Node built-in → Third-party → `@/` alias → Relative
- Props use `defineProps` + TypeScript generics
- Component logic prefers `composables` for reuse

### Styling

- Uses Tailwind CSS 4, supports `@apply`, CSS variables
- Color theme: `--background`, `--foreground`, `--primary`, `--muted`, etc.
- Dark mode: controlled via `useAppColorMode`, CSS variables auto-switch

### Import Alias

- `@/` — `src/` directory alias (configured by vite/tsconfig)

### Form Conventions

- **Form naming:** `name` attribute uses `lowercase_snake_case` format, e.g., `login_form`, `register_form`, `reset_step_1_form`
- **Multi-form split:** When a page contains multiple independent forms (e.g., multi-step flow), each form must be split into separate `.vue` files to avoid conflicts
  - Split components placed in `forms/` subfolder under current directory
  - Child components notify parent via `emit` for next steps
  - Parent manages step state and cross-step shared data

### i18n Key Convention

- Must use i18n key, no hardcoded text
- Key format: `module.submodule.field` (e.g., `views.crypto.hash.title`)

### Enum Convention

- Use TypeScript `enum`, naming `PascalCase` + `Enum` suffix (e.g., `ResponseCodeEnum`)
- Enum values use `UPPER_SNAKE_CASE`

## Code Style

- All TypeScript, 2-space indent, LF line ending, UTF-8 encoding
- Naming: Component `PascalCase`, method/variable `camelCase`, constant `UPPER_SNAKE_CASE`
- Format follows ESLint + Prettier, use oxlint for fast checking
- Import sorting: eslint-plugin-simple-import-sort