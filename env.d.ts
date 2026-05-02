/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_URL?: string
  readonly VITE_OWNER?: string
  readonly VITE_BEIAN_URL?: string
  readonly VITE_MINIO_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

