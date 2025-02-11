import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  define:{
    '__DEV__':true
  },
  plugins: [react()],
  optimizeDeps: {
    disabled: true,
    noDiscovery: true,
    include: []
  },
  resolve:{
    alias:[
      {
        find:'hostConfig',
        replacement:path.resolve(__dirname,'../../packages/react-dom/src/hostConfig')
      }
    ]
  }
})
