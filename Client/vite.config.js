import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward all API calls to the Express backend on port 5000
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/reputation': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/profile': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/badges': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
