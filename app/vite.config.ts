import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  define: { 'process.env.NODE_DEBUG': false },
  plugins: [react(), eslint()],
  resolve: { alias: { '~': path.resolve(__dirname, 'src') } }
})
