import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "tailwindcss";
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://y-narae.pockethost.io",
        changeOrigin: true,
        ws: true,     // realtime(SSE/WS) 경유
        secure: true,
        // rewrite: (p) => p, // 굳이 안 써도 됨
      },
    },
},
});
