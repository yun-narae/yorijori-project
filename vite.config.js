// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import path from 'path';

const isPkg = (id, pkg) => id.includes(`/node_modules/${pkg}/`) || id.endsWith(`/node_modules/${pkg}`);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React core (정밀 매칭)
          if (isPkg(id, 'react-dom')) return 'vendor-react-dom';
          if (isPkg(id, 'react')) return 'vendor-react';               // react & react/jsx-runtime 포함

          // Router는 React와 분리 (과매칭 방지)
          if (isPkg(id, 'react-router-dom') || isPkg(id, 'react-router')) {
            return 'vendor-react-router';
          }

          // 프로젝트에서 무거운 것들
          if (isPkg(id, 'swiper')) return 'vendor-swiper';
          if (isPkg(id, 'pocketbase')) return 'vendor-pocketbase';
          if (isPkg(id, 'framer-motion')) return 'vendor-framer';
          if (isPkg(id, 'dayjs')) return 'vendor-dayjs';
          if (isPkg(id, 'lucide-react')) return 'vendor-icons';

          // 그 외 공통
          return 'vendor';
        },
      },
    },
  },
});
