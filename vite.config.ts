import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
    },
  },
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer')
    }
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
})
