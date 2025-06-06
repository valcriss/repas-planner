import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
