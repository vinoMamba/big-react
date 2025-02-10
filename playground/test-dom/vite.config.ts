import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    __DEV__: mode === 'development'
  }
}))
