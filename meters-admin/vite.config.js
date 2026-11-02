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
      // Не переходить молча на другой порт, если 5173 занят (например, другим Vite-проектом):
      // иначе в браузере по старому адресу останется чужое приложение
      strictPort: true,
      proxy: {
        // Запросы /api/* перенаправляются на сервер сайта, где API расположено в каталоге /api:
        // http://localhost:5173/api/readings -> http://localhost:8080/api/readings
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
