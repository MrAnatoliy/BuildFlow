import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  
	server: {
		host: '26.190.118.118',
		port: 80,
		/*
			https: {
				key: fs.readFileSync(path.resolve(__dirname, 'ssl/buildflow.org-key.pem')),
				cert: fs.readFileSync(path.resolve(__dirname, 'ssl/buildflow.org.pem'))
			},
		*/
	},

	plugins: [
		tailwindcss(),
        autoprefixer(),
		react()
	],

	assetsInclude: ['**/*.woff', '**/*.woff2'],


	build: {
		minify: 'terser',
		terserOptions: { compress: true }
	},

	optimizeDeps: {
		include: ['pdfjs-dist/build/pdf.mjs', 'pdfjs-dist/build/pdf.worker.mjs'],
	},
})