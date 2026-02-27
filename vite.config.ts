import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'text-analysis': ['compromise', 'syllable', 'flesch-kincaid', 'reading-time', 'text-readability'],
          'file-handling': ['mammoth', 'docx', 'file-saver', 'file-type'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
