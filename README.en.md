# arona-blog-web

[中文](./README.md) | English

Frontend web service for Arona's personal blog. A comprehensive developer toolkit featuring encryption tools, time utilities, text processing, and miHoYo game gacha record analysis.

## Features

### Developer Tools (`/develop`)

| Tool                        | Description                                                                   |
| --------------------------- | ----------------------------------------------------------------------------- |
| **Password Generator**      | Generate secure random passwords with customizable length and character sets  |
| **NanoID Generator**        | Generate unique IDs using NanoID algorithm                                    |
| **JSON Formatter**          | Format, validate, and beautify JSON data                                      |
| **Byte Calculator**         | Convert between bytes, KB, MB, GB, TB                                         |
| **Roman Numeral Converter** | Convert between Arabic and Roman numerals                                     |
| **Color Picker**            | Color conversion (HEX, RGB, HSL) with visual picker                           |
| **Radix Converter**         | Convert numbers between different bases (binary, octal, decimal, hexadecimal) |

### Encryption Tools (`/crypto`)

| Tool            | Description                                         |
| --------------- | --------------------------------------------------- |
| **MD5 Hash**    | Generate MD5 hash for text input                    |
| **SHA Hash**    | Generate SHA-1, SHA-256, SHA-512 hashes             |
| **Base64**      | Encode/decode Base64 strings                        |
| **JWT Decoder** | Decode and inspect JWT tokens                       |
| **RSA**         | RSA encryption/decryption with key pair generation  |
| **RC4**         | RC4 stream cipher encryption/decryption             |
| **SM2**         | Chinese national standard SM2 asymmetric encryption |
| **SM4**         | Chinese national standard SM4 symmetric encryption  |
| **AES**         | AES symmetric encryption with multiple key sizes    |
| **DES**         | DES symmetric encryption (legacy support)           |

### Time Tools (`/time`)

| Tool                    | Description                                         |
| ----------------------- | --------------------------------------------------- |
| **Timestamp Converter** | Convert between Unix timestamp and datetime formats |
| **Date Calculator**     | Calculate date differences, add/subtract days       |
| **World Clock**         | Display multiple timezone clocks simultaneously     |

### Text Tools (`/text`)

| Tool                    | Description                          |
| ----------------------- | ------------------------------------ |
| **URL Encoder/Decoder** | Encode/decode URL components         |
| **Unicode Converter**   | Convert between Unicode and text     |
| **Hex String**          | Convert between hexadecimal and text |

### Gacha Record Analysis (`/gacha`)

A comprehensive gacha record viewer and analyzer for three miHoYo games:

| Game                  | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| **Genshin Impact**    | View all gacha pools with statistics, pity counter, item timeline |
| **Honkai: Star Rail** | Track warp history with pool breakdown and 5★ statistics          |
| **Zenless Zone Zero** | Analyze Signal Search and Bangboo contracts                       |

Key features:

- Import via API URL (authkey from game)
- Pool-based filtering and search
- Pity counter (guaranteed progress)
- Export to Excel/JSON/CSV
- Visual item timeline with icons
- Real-time sync progress via WebSocket

### User System (`/user`)

- **Login/Register** — Email registration with captcha verification
- **Password Recovery** — Multi-step password reset via email
- **Profile Management** — Update nickname, birthday, gender
- **Password Change** — Change password with verification

### Admin Features

- **Log Viewer** (`/log`) — Real-time log streaming via WebSocket (admin only)
- **System Config** (`/system/config`) — Runtime configuration management (admin only)

## Project Architecture

| Component        | Version              |
| ---------------- | -------------------- |
| Framework        | Vue 3                |
| Language         | TypeScript 5.9.3     |
| Build Tool       | Vite 8               |
| State Management | Pinia                |
| Router           | Vue Router 5         |
| i18n             | Vue I18n             |
| Styling          | Tailwind CSS 4       |
| UI Library       | shadcn-vue (reka-ui) |

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

**Node.js Requirement:** >= 24.0.0 (Volta locked at 24.18.0)

## Architecture Design

### Directory Structure (src/)

```
main.ts                   — Application entry, creates Vue instance and mounts plugins
App.vue                   — Root component
style.css                 — Global styles (Tailwind entry)
assets/                   — Static resources (images, favicon, etc.)
components/ui/            — UI component library (shadcn-vue style, based on reka-ui)
  button.vue              — Button variants (primary, secondary, outline, ghost, destructive)
  input.vue               — Text input with validation support
  textarea.vue            — Multi-line text input
  form/                   — Form components with vee-validate integration
  dialog.vue              — Modal dialog
  drawer.vue              — Side drawer (mobile-friendly)
  sheet.vue               — Side sheet
  sidebar.vue             — Collapsible sidebar navigation
  dropdown-menu.vue       — Dropdown menu
  avatar.vue              — User avatar with fallback
  select.vue              — Select dropdown
  combobox.vue            — Combobox with search
  checkbox.vue            — Checkbox with label
  switch.vue              — Toggle switch
  radio-group.vue         — Radio button group
  tabs.vue                — Tab navigation
  table.vue               — Static table
  data-table.vue          — Dynamic table with sorting, filtering, pagination
  pagination.vue          — Pagination controls
  calendar.vue            — Calendar picker
  date-picker.vue         — Date picker with popover
  upload.vue              — File upload with drag-drop
  tooltip.vue             — Tooltip popover
  skeleton.vue            — Loading skeleton
  separator.vue           — Horizontal/vertical separator
  scroll-area.vue         — Scrollable container with scrollbar styling
  empty.vue               — Empty state placeholder
  sonner.vue              — Toast notifications (vue-sonner wrapper)
components/layout/        — Layout components
  AppLayout.vue           — Main layout: Header + Sidebar + RouterView
  SectionOutlet.vue       — Nested route outlet for section pages
  Header.vue              — Top header with navigation, user menu, locale toggle
  Footer.vue              — Page footer
components/common/        — Common shared components
views/                    — Page views, organized by feature modules
  develop/                — Developer tools (password, nanoid, json, byte, roman, color, radix)
  crypto/                 — Encryption tools (md5, sha, base64, jwt, rsa, rc4, sm2, sm4, aes, des)
  time/                   — Time tools (timestamp, calculator, world clock)
  text/                   — Text tools (url, unicode, hex)
  gacha/                  — Gacha record viewer (genshin, starrail, zzz)
    components/           — Gacha-specific components (pool selector, record table, export dialog)
    dialog/               — Gacha dialogs (import URL, sync progress, export format)
  user/                   — User system
    login/                — Login page with captcha
    register/             — Registration page
    reset/                — Password reset flow (multi-step forms)
    profile/              — User profile management
    password/             — Change password
  log/                    — Admin log viewer
  system/                 — Admin system config
  about/                  — About page
  error/                  — Error pages (404)
plugins/                  — Vue plugin registration
  router.ts               — Vue Router configuration with guards
  store.ts                — Pinia store initialization
  i18n.ts                 — Vue I18n configuration
stores/                   — Pinia state management
  user.ts                 — User login state, userInfo, roles
composables/              — Vue composition functions
  useAppColorMode.ts      — Dark/light mode toggle with localStorage persistence
  useDocumentTitleI18n.ts — Set document title from i18n key
  useCaptchaSendCooldown.ts — Captcha send cooldown timer
lib/                      — Utility functions and library wrappers
  request.ts              — Axios wrapper with caching, dedup, error handling
  nprogress.ts            — NProgress loading bar wrapper
  utils.ts                — Common utility functions
  websocket.ts            — WebSocket client for real-time communication
fetch/                    — API request wrappers (Get, Post, Put, Delete)
  index.ts                — Base request helpers
  captcha/                — Captcha API calls
  file/                   — File upload API
  gacha/                  — Gacha sync, export, config API
  log/                    — Log file API
  login/                  — Login API
  logout/                 — Logout API
  register/               — Register API
  user/                   — User profile, password API
  system/                 — System config API
definitions/              — Constants, enums, type definitions
  constants/              — Runtime constants
  enums/                  — Enum definitions (ResponseCodeEnum, GameTypeEnum)
  types/                  — TypeScript type definitions
locale/                   — i18n translations (zh_cn/, en_us/)
  global.json             — Global translations (common words, errors, success messages)
  layout.json             — Layout translations (nav items, header)
  views.*.json            — Page-specific translations (e.g., views.crypto.json)
types/                    — Global type declarations (vue-router.d.ts)
```

### Routing Structure

Uses `createWebHistory` mode with nested route sections:

| Route               | Description               | Meta                                         |
| ------------------- | ------------------------- | -------------------------------------------- |
| `/develop`          | Developer tools overview  | Sidebar nav                                  |
| `/develop/password` | Password generator        | `titleKey`                                   |
| `/develop/nanoid`   | NanoID generator          | `titleKey`                                   |
| `/develop/json`     | JSON formatter            | `titleKey`                                   |
| `/develop/byte`     | Byte calculator           | `titleKey`                                   |
| `/develop/roman`    | Roman numeral converter   | `titleKey`                                   |
| `/develop/color`    | Color picker              | `titleKey`                                   |
| `/develop/radix`    | Radix converter           | `titleKey`                                   |
| `/crypto`           | Encryption tools overview | Sidebar nav                                  |
| `/crypto/md5`       | MD5 hash                  | `titleKey`                                   |
| `/crypto/sha`       | SHA hash                  | `titleKey`                                   |
| `/crypto/base64`    | Base64                    | `titleKey`                                   |
| `/crypto/jwt`       | JWT decoder               | `titleKey`                                   |
| `/crypto/rsa`       | RSA                       | `titleKey`                                   |
| `/crypto/rc4`       | RC4                       | `titleKey`                                   |
| `/crypto/sm2`       | SM2                       | `titleKey`                                   |
| `/crypto/sm4`       | SM4                       | `titleKey`                                   |
| `/crypto/aes`       | AES                       | `titleKey`                                   |
| `/crypto/des`       | DES                       | `titleKey`                                   |
| `/time`             | Time tools overview       | Sidebar nav                                  |
| `/time/timestamp`   | Timestamp converter       | `titleKey`                                   |
| `/time/calculator`  | Date calculator           | `titleKey`                                   |
| `/time/world`       | World clock               | `titleKey`                                   |
| `/text`             | Text tools overview       | Sidebar nav                                  |
| `/text/url`         | URL encoder               | `titleKey`                                   |
| `/text/unicode`     | Unicode converter         | `titleKey`                                   |
| `/text/hex`         | Hex converter             | `titleKey`                                   |
| `/gacha`            | Gacha overview            | `authOnly404`                                |
| `/gacha/genshin`    | Genshin Impact gacha      | `authOnly404`, `titleKey`                    |
| `/gacha/starrail`   | Honkai: Star Rail gacha   | `authOnly404`, `titleKey`                    |
| `/gacha/zzz`        | Zenless Zone Zero gacha   | `authOnly404`, `titleKey`                    |
| `/user/login`       | Login page                | `guestOnly`, `hideSidebar`                   |
| `/user/register`    | Register page             | `guestOnly`, `hideSidebar`                   |
| `/user/reset`       | Password reset            | `guestOnly`, `hideSidebar`                   |
| `/user/profile`     | User profile              | `requireAuth`, `hideSidebar`                 |
| `/user/password`    | Change password           | `requireAuth`, `hideSidebar`                 |
| `/log`              | Log viewer                | `requireAuth`, `requireAdmin`, `hideSidebar` |
| `/system/config`    | System config             | `requireAuth`, `requireAdmin`, `hideSidebar` |
| `/about`            | About page                | `hideSidebar`                                |
| `/:pathMatch(.*)*`  | 404 page                  | `hideSidebar`                                |

### Route Meta Fields

| Field          | Type    | Description                                                   |
| -------------- | ------- | ------------------------------------------------------------- |
| `titleKey`     | string  | i18n key for page title                                       |
| `sidebarNav`   | array   | Sidebar navigation config `[{ to, labelKey }]`                |
| `hideSidebar`  | boolean | Hide sidebar (full-width page)                                |
| `requireAuth`  | boolean | Requires login, redirects to `/user/login`                    |
| `guestOnly`    | boolean | Only for guests, redirects logged-in users to `/user/profile` |
| `authOnly404`  | boolean | Returns 404 for non-logged-in users                           |
| `requireAdmin` | boolean | Requires administrator role, returns 404 for non-admins       |

### Request Wrapper

Based on Axios wrapper in `lib/request.ts`:

- **Request caching:** Uses SM3 hash as cache key, avoids duplicate requests
- **Request dedup:** Prevents multiple requests to same URL in short time
- **Response interceptor:** Auto handles `redirect` field, shows error toast notifications
- **Response format:** `{ code, msg, data, redirect }`, `code: 0` means success
- **Methods:** `Get`, `Post`, `Put`, `Delete` exported from `fetch/index.ts`

### WebSocket Client

`wsService` in `lib/websocket.ts`:

- Auto-connects after user login (called from router guard)
- Disconnects on user logout
- Connection requires valid session cookie (authenticated by backend)
- Event routing: `module:action` format
  - `log:subscribe/unsubscribe/init/update` — Log streaming
  - `gacha:sync-log` — Real-time gacha sync progress
  - `session:kicked` — Another session logged in (kick current)
- Heartbeat and auto-reconnection (max 5 attempts)
- Locale sync via `locale:update` message

### Internationalization

- Uses `vue-i18n`, supports `zh-CN` / `en-US`
- Translation files organized by modules: `global.json`, `layout.json`, `views.*.json`
- i18n key uses dot hierarchy (e.g., `layout.nav.modules.crypto`)
- Each key must exist in both Chinese and English
- Storage key: `arona-locale` in localStorage
- Auto-sync locale to WebSocket server on change

### State Management

- Uses Pinia Composition API style (`defineStore` + `ref`)
- `useUserStore` — User login state, userInfo, roles
  - `isLoggedIn()` — Check if user is logged in
  - `setUserInfo(data)` — Set user info from API
  - `clearUserInfo()` — Clear on logout

### UI Components

Based on `reka-ui` (unstyled Vue component library) + Tailwind CSS:

- **Form components:** Button, Input, Textarea, Checkbox, Switch, RadioGroup, Select, Combobox
- **Navigation:** Sidebar, Tabs, Pagination
- **Overlay:** Dialog, Drawer, Sheet, DropdownMenu, Tooltip, Popover
- **Data display:** Table, DataTable, Avatar, Calendar, DatePicker
- **Layout:** ScrollArea, Separator, Skeleton
- **Feedback:** Sonner (toast notifications), Empty state

Components follow shadcn-vue style patterns with Tailwind CSS styling.

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

- **Form naming:** `name` attribute uses `lowercase_snake_case` format, e.g., `login_form`, `register_form`
- **Multi-form split:** When a page contains multiple independent forms, each form must be split into separate `.vue` files
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
- Format follows ESLint + Prettier
- Import sorting: eslint-plugin-simple-import-sort
