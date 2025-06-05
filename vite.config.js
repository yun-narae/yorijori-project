import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import compression from 'vite-plugin-compression';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(), // React 플러그인
    compression({
      algorithm: 'brotliCompress', // 또는 'gzip' 사용 가능
      ext: '.br', // 압축된 파일 확장자 설정 (.gz 또는 .br)
    }),
  ],
  css: {
    postcss: {
      plugins: [require('@tailwindcss/postcss')],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      }
    },
  },
  define: {
    'process.env': {}
  }
});
