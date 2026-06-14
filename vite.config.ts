import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge'
import path from 'path'

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(process.cwd())
  const env = loadEnv(mode, envDir, '')

  const isDev = mode === 'development'
  const isProd = mode === 'production'

  return {
    envDir,
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || mode),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    build: {
      sourcemap: isDev ? 'inline' : 'hidden',
      minify: isProd ? 'esbuild' : false,
      target: 'es2020',
    },
    server: {
      port: 5173,
      host: true,
      strictPort: false,
    },
    preview: {
      port: 4173,
      host: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    plugins: [
      react({
        babel: {
          plugins: isDev ? ['react-dev-locator'] : [],
        },
      }),
      traeBadgePlugin({
        variant: 'dark',
        position: 'bottom-right',
        prodOnly: true,
        clickable: true,
        clickUrl: 'https://www.trae.ai/solo?showJoin=1',
        autoTheme: true,
        autoThemeTarget: '#root',
      }),
      tsconfigPaths(),
    ],
  }
})
