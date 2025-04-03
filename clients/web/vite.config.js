import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  
  plugins: [
    tailwindcss(),
    react()
  ],

  server: {
    host: '26.190.118.118',
    port: 80,
    /*
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/buildflow.org-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/buildflow.org.pem'))
    },
    */
    proxy: {
      '/api': {
        target: 'http://buildflow.api',
        port: 3000,
        changeOrigin: true,
        secure: false,
        withCredentials: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
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