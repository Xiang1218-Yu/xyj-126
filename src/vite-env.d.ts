/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' | 'silent'
  readonly VITE_UPLOAD_MAX_SIZE: string
  readonly VITE_STORAGE_PREFIX: string
  readonly VITE_QR_CODE_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
