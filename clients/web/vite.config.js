import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],

  server: {
    host: '26.190.118.118',
    port: 80,
    proxy: {
      '/api': {
        target: 'http://buildflow.api',
        changeOrigin: true,
        secure: false,
        withCredentials: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://buildflow.api')
  },

  build: {
    minify: 'terser',
    terserOptions: { compress: true }
  },

})