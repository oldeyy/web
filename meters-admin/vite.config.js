import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения из .env, чтобы использовать их в конфигурации
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), vueDevTools()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      // host: '0.0.0.0', // Раскомментируйте, чтобы открывать приложение с других устройств в локальной сети
      port: 5173,
      proxy: {
        // Все запросы вида /api/* перенаправляются на бэкенд публичной части сайта:
        // /api/readings -> http://meters.local/readings
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://meters.local',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
