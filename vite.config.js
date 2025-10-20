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
        configure: (proxy, options) => {
          // CORS 및 프로토콜 에러 방지를 위한 설정
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Alt-Svc', ''); // HTTP/3 비활성화
            proxyReq.setHeader('Origin', 'https://y-narae.pockethost.io'); // CORS 해결
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // CORS 헤더 추가
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
          });
        },
      },
      "/api/realtime": {
        target: "http://127.0.0.1:8090",
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
},
});
