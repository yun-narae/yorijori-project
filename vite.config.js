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
        // 프론트에서 /pb 로 호출하면 PocketHost 로 프록시
        "/api": {
            target: "http://127.0.0.1:8090",
            changeOrigin: true,
            ws: true,               // 실시간 구독(WebSocket)도 프록시
            secure: true,
            rewrite: (path) => path.replace(/^\/api/, ""),
          },
    },
},
});
