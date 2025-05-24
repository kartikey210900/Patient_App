import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    tailwindcss(),
  ],

  assetsInclude: ['**/*.wasm'],

  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

 
})
