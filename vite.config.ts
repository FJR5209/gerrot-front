import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/gerrot-front/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      // Proxy APENAS o prefixo /api para o backend, evitando conflito com rotas do SPA
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
