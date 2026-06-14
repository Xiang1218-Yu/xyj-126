export type AppEnvironment = 'development' | 'production' | 'test'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface AppConfig {
  env: AppEnvironment
  appName: string
  appVersion: string
  apiBaseUrl: string
  wsUrl: string
  enableMock: boolean
  logLevel: LogLevel
  uploadMaxSize: number
  storagePrefix: string
  qrCodeBaseUrl: string
}

interface EnvSchema {
  key: keyof ImportMetaEnv
  required: boolean
  type: 'string' | 'boolean' | 'number'
  allowedValues?: string[]
  validate?: (value: string) => boolean
}

const envSchema: EnvSchema[] = [
  {
    key: 'VITE_APP_ENV',
    required: true,
    type: 'string',
    allowedValues: ['development', 'production', 'test'],
  },
  {
    key: 'VITE_APP_NAME',
    required: true,
    type: 'string',
  },
  {
    key: 'VITE_APP_VERSION',
    required: true,
    type: 'string',
  },
  {
    key: 'VITE_API_BASE_URL',
    required: true,
    type: 'string',
    validate: (v) => /^https?:\/\/.+/.test(v),
  },
  {
    key: 'VITE_WS_URL',
    required: true,
    type: 'string',
    validate: (v) => /^wss?:\/\/.+/.test(v),
  },
  {
    key: 'VITE_ENABLE_MOCK',
    required: true,
    type: 'boolean',
  },
  {
    key: 'VITE_LOG_LEVEL',
    required: true,
    type: 'string',
    allowedValues: ['debug', 'info', 'warn', 'error', 'silent'],
  },
  {
    key: 'VITE_UPLOAD_MAX_SIZE',
    required: true,
    type: 'number',
    validate: (v) => parseInt(v, 10) > 0,
  },
  {
    key: 'VITE_STORAGE_PREFIX',
    required: true,
    type: 'string',
  },
  {
    key: 'VITE_QR_CODE_BASE_URL',
    required: true,
    type: 'string',
    validate: (v) => /^https?:\/\/.+/.test(v),
  },
]

function parseValue(value: string, type: 'string' | 'boolean' | 'number'): unknown {
  switch (type) {
    case 'boolean':
      return value.toLowerCase() === 'true'
    case 'number':
      return parseInt(value, 10)
    default:
      return value
  }
}

function validateEnv(): string[] {
  const errors: string[] = []

  for (const schema of envSchema) {
    const rawValue = import.meta.env[schema.key]

    if (!rawValue) {
      if (schema.required) {
        errors.push(`缺少必填环境变量: ${schema.key}`)
      }
      continue
    }

    if (schema.type === 'number' && Number.isNaN(parseInt(rawValue, 10))) {
      errors.push(`环境变量 ${schema.key} 必须是有效的数字，当前值: ${rawValue}`)
      continue
    }

    if (schema.type === 'boolean' && !['true', 'false'].includes(rawValue.toLowerCase())) {
      errors.push(`环境变量 ${schema.key} 必须是 true 或 false，当前值: ${rawValue}`)
      continue
    }

    if (schema.allowedValues && !schema.allowedValues.includes(rawValue)) {
      errors.push(
        `环境变量 ${schema.key} 必须是 [${schema.allowedValues.join(', ')}] 之一，当前值: ${rawValue}`,
      )
      continue
    }

    if (schema.validate && !schema.validate(rawValue)) {
      errors.push(`环境变量 ${schema.key} 格式不合法，当前值: ${rawValue}`)
    }
  }

  return errors
}

const validationErrors = validateEnv()

if (validationErrors.length > 0) {
  const errorMessage = `环境变量配置错误:\n${validationErrors.map((e) => `  - ${e}`).join('\n')}`

  if (import.meta.env.VITE_APP_ENV === 'development') {
    console.error(errorMessage)
  } else {
    throw new Error(errorMessage)
  }
}

export const env: AppConfig = {
  env: parseValue(import.meta.env.VITE_APP_ENV, 'string') as AppEnvironment,
  appName: parseValue(import.meta.env.VITE_APP_NAME, 'string') as string,
  appVersion: parseValue(import.meta.env.VITE_APP_VERSION, 'string') as string,
  apiBaseUrl: parseValue(import.meta.env.VITE_API_BASE_URL, 'string') as string,
  wsUrl: parseValue(import.meta.env.VITE_WS_URL, 'string') as string,
  enableMock: parseValue(import.meta.env.VITE_ENABLE_MOCK, 'boolean') as boolean,
  logLevel: parseValue(import.meta.env.VITE_LOG_LEVEL, 'string') as LogLevel,
  uploadMaxSize: parseValue(import.meta.env.VITE_UPLOAD_MAX_SIZE, 'number') as number,
  storagePrefix: parseValue(import.meta.env.VITE_STORAGE_PREFIX, 'string') as string,
  qrCodeBaseUrl: parseValue(import.meta.env.VITE_QR_CODE_BASE_URL, 'string') as string,
}

export const isDev = env.env === 'development'
export const isProd = env.env === 'production'
export const isTest = env.env === 'test'
