import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: { global: 'window' },
  build: {
    assetsInlineLimit: 4096, // inline nếu < 4kB
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor';
            if (id.includes('@stomp') || id.includes('sockjs')) return 'stomp';
            if (id.includes('zustand')) return 'zustand';
          }
        }
      }
    }
  }
})
