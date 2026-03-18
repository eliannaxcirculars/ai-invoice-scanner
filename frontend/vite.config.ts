import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Vite configuration for AI Invoice Scanner
 * Uses path aliases for clean imports and React plugin for JSX transform.
 * manualChunks splits vendor and Supabase into separate chunks for better caching.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor'
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
        },
      },
    },
  },
})
